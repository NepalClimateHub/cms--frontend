import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/ui/shadcn/dialog'
import { Button } from '@/ui/shadcn/button'
import { Input } from '@/ui/shadcn/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/shadcn/select'
import { useGetMembers } from '@/query/members/use-members'
import {
  useCreateCertificate,
  AdminCertificateResponse,
} from '@/query/certificates/use-certificates'
import { Copy, Check, Printer, Award, AlertCircle, Loader2 } from 'lucide-react'

interface IssueCertificateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (cert: AdminCertificateResponse, rawToken: string) => void
}

const CERTIFICATE_TYPES = [
  { value: 'VOLUNTEER', label: 'Volunteer Certificate' },
  { value: 'INTERNSHIP', label: 'Internship Certificate' },
  { value: 'TRAINING', label: 'Training Certificate' },
  { value: 'WORKSHOP', label: 'Workshop / Participation Certificate' },
  { value: 'SERVICE', label: 'Service Certificate' },
]

export const IssueCertificateDialog: React.FC<IssueCertificateDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'member' | 'manual'>('member')
  const [selectedMemberId, setSelectedMemberId] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [profilePictureUrl, setProfilePictureUrl] = useState('')
  const [role, setRole] = useState('Volunteer')
  const [teamName, setTeamName] = useState('')
  const [certificateType, setCertificateType] = useState('VOLUNTEER')
  const [dateJoined, setDateJoined] = useState('')
  const [dateEnded, setDateEnded] = useState('')
  const [issuedAt, setIssuedAt] = useState(() => new Date().toISOString().split('T')[0])

  // Success state modal for the one-time verification token
  const [createdResult, setCreatedResult] = useState<{
    cert: AdminCertificateResponse
    code: string
  } | null>(null)
  const [hasCopied, setHasCopied] = useState(false)

  const { data: membersResponse } = useGetMembers({ limit: 100 })
  const members = membersResponse?.data ?? []

  const createMutation = useCreateCertificate()

  const handleMemberSelect = (memberId: string) => {
    setSelectedMemberId(memberId)
    const member = members.find((m) => m.id === memberId)
    if (member) {
      setFullName(member.name)
      setEmail(member.email || '')
      setProfilePictureUrl(member.photoUrl || '')
      setRole(member.role || 'Volunteer')
      if ((member as any).team) {
        setTeamName((member as any).team)
      }
      if (member.startDate) {
        setDateJoined(member.startDate.split('T')[0])
      }
      if (member.endDate) {
        setDateEnded(member.endDate.split('T')[0])
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName || !role || !dateJoined) return

    createMutation.mutate(
      {
        fullName,
        email: email || undefined,
        profilePictureUrl: profilePictureUrl || undefined,
        certificateType,
        role,
        teamName: teamName || undefined,
        dateJoined,
        dateEnded: dateEnded || undefined,
        issuedAt: issuedAt || undefined,
      },
      {
        onSuccess: (res: any) => {
          const cert = res.data as AdminCertificateResponse
          const token = cert.verificationCode || ''
          setCreatedResult({ cert, code: token })
        },
      },
    )
  }

  const handleCopyCode = () => {
    if (!createdResult?.code) return
    navigator.clipboard.writeText(createdResult.code)
    setHasCopied(true)
    setTimeout(() => setHasCopied(false), 2000)
  }

  const handleClose = () => {
    setCreatedResult(null)
    setFullName('')
    setEmail('')
    setProfilePictureUrl('')
    setRole('Volunteer')
    setTeamName('')
    setDateJoined('')
    setDateEnded('')
    setIssuedAt(new Date().toISOString().split('T')[0])
    setSelectedMemberId('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='max-w-lg'>
        {!createdResult ? (
          <>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2 text-lg font-bold'>
                <Award className='h-5 w-5 text-emerald-600' />
                Issue Certificate
              </DialogTitle>
              <DialogDescription className='text-xs text-slate-500'>
                Generate an authentic NCH certificate with an unpredictable verification token and QR code.
              </DialogDescription>
            </DialogHeader>

            {/* Selection Mode Toggle */}
            <div className='grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium'>
              <button
                type='button'
                onClick={() => setMode('member')}
                className={`py-1.5 rounded-md transition-all ${
                  mode === 'member'
                    ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100 font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Existing Member
              </button>
              <button
                type='button'
                onClick={() => {
                  setMode('manual')
                  setSelectedMemberId('')
                }}
                className={`py-1.5 rounded-md transition-all ${
                  mode === 'manual'
                    ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100 font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Custom Volunteer
              </button>
            </div>

            <form onSubmit={handleSubmit} className='space-y-4 text-xs sm:text-sm mt-2'>
              {mode === 'member' && (
                <div>
                  <label className='block font-semibold mb-1 text-slate-700 dark:text-slate-300'>
                    Select NCH Member
                  </label>
                  <Select value={selectedMemberId} onValueChange={handleMemberSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder='Select an existing team member' />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name} ({m.role || 'Member'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                <div>
                  <label className='block font-semibold mb-1 text-slate-700 dark:text-slate-300'>
                    Full Name *
                  </label>
                  <Input
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder='e.g. Bibek Pant'
                  />
                </div>

                <div>
                  <label className='block font-semibold mb-1 text-slate-700 dark:text-slate-300'>
                    Role / Position *
                  </label>
                  <Input
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder='e.g. Volunteer, Climate Fellow'
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                <div>
                  <label className='block font-semibold mb-1 text-slate-700 dark:text-slate-300'>
                    Team Name (Admin entry)
                  </label>
                  <Input
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder='e.g. Advocacy & Communications'
                  />
                </div>

                <div>
                  <label className='block font-semibold mb-1 text-slate-700 dark:text-slate-300'>
                    Certificate Type
                  </label>
                  <Select value={certificateType} onValueChange={setCertificateType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CERTIFICATE_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                <div>
                  <label className='block font-semibold mb-1 text-slate-700 dark:text-slate-300'>
                    Start Date (Joined) *
                  </label>
                  <Input
                    required
                    type='date'
                    value={dateJoined}
                    onChange={(e) => setDateJoined(e.target.value)}
                  />
                </div>

                <div>
                  <label className='block font-semibold mb-1 text-slate-700 dark:text-slate-300'>
                    End Date (Completed)
                  </label>
                  <Input
                    type='date'
                    value={dateEnded}
                    onChange={(e) => setDateEnded(e.target.value)}
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                <div>
                  <label className='block font-semibold mb-1 text-slate-700 dark:text-slate-300'>
                    Issue Date *
                  </label>
                  <Input
                    required
                    type='date'
                    value={issuedAt}
                    onChange={(e) => setIssuedAt(e.target.value)}
                  />
                </div>

                <div>
                  <label className='block font-semibold mb-1 text-slate-700 dark:text-slate-300'>
                    Email (Private)
                  </label>
                  <Input
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder='volunteer@example.com'
                  />
                </div>
              </div>

              <div>
                <label className='block font-semibold mb-1 text-slate-700 dark:text-slate-300'>
                  Profile Photo URL
                </label>
                <Input
                  value={profilePictureUrl}
                  onChange={(e) => setProfilePictureUrl(e.target.value)}
                  placeholder='https://...'
                />
              </div>

              <div className='flex justify-end gap-2 pt-2 border-t'>
                <Button type='button' variant='outline' onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  type='submit'
                  disabled={createMutation.isPending || !fullName || !role || !dateJoined}
                  className='bg-emerald-600 hover:bg-emerald-700 text-white'
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className='h-4 w-4 animate-spin mr-2' />
                      Generating...
                    </>
                  ) : (
                    'Generate Certificate'
                  )}
                </Button>
              </div>
            </form>
          </>
        ) : (
          /* ONE-TIME RAW TOKEN DISPLAY MODAL */
          <div className='space-y-4 py-2'>
            <DialogHeader>
              <DialogTitle className='text-emerald-700 dark:text-emerald-400 flex items-center gap-2 text-lg'>
                <Award className='h-5 w-5' />
                Certificate Issued Successfully!
              </DialogTitle>
              <DialogDescription className='text-xs text-slate-600 dark:text-slate-400'>
                A cryptographically random token has been generated. Per security guidelines, the database stores only its SHA-256 hash.
              </DialogDescription>
            </DialogHeader>

            <div className='p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3'>
              <div>
                <span className='text-xs text-slate-500'>Certificate Number:</span>
                <div className='font-mono font-bold text-sm text-slate-900 dark:text-slate-100'>
                  {createdResult.cert.certificateNumber}
                </div>
              </div>

              <div>
                <span className='text-xs text-slate-500 font-semibold'>
                  Raw Verification Token (One-Time Display):
                </span>
                <div className='flex items-center gap-2 mt-1'>
                  <code className='flex-1 p-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded font-mono text-xs font-bold text-emerald-900 dark:text-emerald-200 break-all select-all'>
                    {createdResult.code}
                  </code>
                  <Button
                    type='button'
                    size='sm'
                    variant='outline'
                    onClick={handleCopyCode}
                    className='shrink-0 h-9 gap-1 text-xs'
                  >
                    {hasCopied ? (
                      <>
                        <Check className='h-3.5 w-3.5 text-emerald-600' />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className='h-3.5 w-3.5' />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className='flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-lg text-amber-800 dark:text-amber-300 text-xs'>
              <AlertCircle className='h-4 w-4 shrink-0 mt-0.5' />
              <span>
                <strong>Important:</strong> This verification code will not be shown in plaintext again. Ensure it is printed on the physical or digital certificate.
              </span>
            </div>

            <div className='flex justify-end gap-2 pt-2 border-t'>
              <Button
                type='button'
                variant='outline'
                onClick={handleClose}
              >
                Close
              </Button>
              <Button
                type='button'
                onClick={() => {
                  onSuccess(createdResult.cert, createdResult.code)
                  handleClose()
                }}
                className='bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5'
              >
                <Printer className='h-4 w-4' />
                Preview & Print Certificate
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
