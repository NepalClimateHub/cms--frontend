import { useState, useMemo } from 'react'
import { getRoleFromToken } from '@/utils/jwt.util'
import {
  useGetCertificates,
  AdminCertificateResponse,
} from '@/query/certificates/use-certificates'
import { Main } from '@/ui/layouts/main'
import PageHeader from '@/ui/page-header'
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/shadcn/avatar'
import { Badge } from '@/ui/shadcn/badge'
import { Button } from '@/ui/shadcn/button'
import { Input } from '@/ui/shadcn/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/shadcn/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/ui/shadcn/dropdown-menu'
import {
  Award,
  Plus,
  Search,
  MoreVertical,
  Printer,
  Download,
  ExternalLink,
  RefreshCw,
  Ban,
  History,
  CheckCircle2,
  XCircle,
  ShieldCheck,
} from 'lucide-react'
import { IssueCertificateDialog } from '../components/issue-certificate-dialog'
import {
  CertificatePreviewDialog,
  CertificatePreviewData,
} from '../components/certificate-preview-dialog'
import { RevokeCertificateDialog } from '../components/revoke-certificate-dialog'
import { RegenerateCodeDialog } from '../components/regenerate-code-dialog'
import { VerificationLogsDialog } from '../components/verification-logs-dialog'

export default function CertificateList() {
  const canIssueCertificates = getRoleFromToken() === 'SUPER_ADMIN'
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [page] = useState(0)
  const pageSize = 50

  // Modals state
  const [isIssueOpen, setIsIssueOpen] = useState(false)
  const [previewData, setPreviewData] = useState<CertificatePreviewData | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [selectedCertForRevoke, setSelectedCertForRevoke] =
    useState<AdminCertificateResponse | null>(null)
  const [isRevokeOpen, setIsRevokeOpen] = useState(false)
  const [selectedCertForRegenerate, setSelectedCertForRegenerate] =
    useState<AdminCertificateResponse | null>(null)
  const [isRegenerateOpen, setIsRegenerateOpen] = useState(false)
  const [selectedCertForLogs, setSelectedCertForLogs] =
    useState<AdminCertificateResponse | null>(null)
  const [isLogsOpen, setIsLogsOpen] = useState(false)

  const { data: certResponse, isLoading } = useGetCertificates({
    offset: page * pageSize,
    limit: pageSize,
    search: searchTerm || undefined,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    certificateType: typeFilter !== 'ALL' ? typeFilter : undefined,
  })

  const certificates = useMemo(() => {
    return certResponse?.data || []
  }, [certResponse?.data])

  const totalCount = certResponse?.meta?.count || 0

  // Summary Metrics
  const stats = useMemo(() => {
    const total = totalCount
    const active = certificates.filter((c) => c.status === 'ACTIVE').length
    const revoked = certificates.filter((c) => c.status === 'REVOKED').length
    const totalVerifications = certificates.reduce(
      (sum, c) => sum + (c.verificationCount || 0),
      0,
    )
    return { total, active, revoked, totalVerifications }
  }, [certificates, totalCount])

  const handlePreview = (cert: AdminCertificateResponse, rawToken?: string) => {
    setPreviewData({
      certificateNumber: cert.certificateNumber,
      verificationCode: rawToken || cert.verificationCode,
      name: cert.volunteer.fullName,
      role: cert.role,
      teamName: cert.teamName,
      certificateType: cert.certificateType,
      dateJoined: cert.dateJoined,
      dateEnded: cert.dateEnded,
      issuedAt: cert.issuedAt,
      organization: 'Nepal Climate Hub',
    })
    setIsPreviewOpen(true)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <Main>
      <PageHeader
        title='Certificates'
        description='Generate, manage, and verify authentic Nepal Climate Hub certificates with cryptographic validation.'
        actions={
          canIssueCertificates ? (
            <div className='flex items-center gap-2'>
              <Button
                onClick={() => setIsIssueOpen(true)}
                className='bg-emerald-600 hover:bg-emerald-700 text-white gap-2'
              >
                <Plus className='h-4 w-4' />
                Issue Certificate
              </Button>
            </div>
          ) : undefined
        }
      />

      {/* Summary KPI Cards */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
        <div className='p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3'>
          <div className='h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600'>
            <Award className='h-5 w-5' />
          </div>
          <div>
            <div className='text-xs text-slate-500 font-medium'>Total Certificates</div>
            <div className='text-xl font-bold text-slate-900 dark:text-slate-100'>
              {stats.total}
            </div>
          </div>
        </div>

        <div className='p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3'>
          <div className='h-10 w-10 rounded-lg bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-600'>
            <CheckCircle2 className='h-5 w-5' />
          </div>
          <div>
            <div className='text-xs text-slate-500 font-medium'>Active Records</div>
            <div className='text-xl font-bold text-slate-900 dark:text-slate-100'>
              {stats.active}
            </div>
          </div>
        </div>

        <div className='p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3'>
          <div className='h-10 w-10 rounded-lg bg-red-50 dark:bg-red-950/60 flex items-center justify-center text-red-600'>
            <XCircle className='h-5 w-5' />
          </div>
          <div>
            <div className='text-xs text-slate-500 font-medium'>Revoked Records</div>
            <div className='text-xl font-bold text-slate-900 dark:text-slate-100'>
              {stats.revoked}
            </div>
          </div>
        </div>

        <div className='p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3'>
          <div className='h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600'>
            <ShieldCheck className='h-5 w-5' />
          </div>
          <div>
            <div className='text-xs text-slate-500 font-medium'>Verification Checks</div>
            <div className='text-xl font-bold text-slate-900 dark:text-slate-100'>
              {stats.totalVerifications}
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className='flex flex-col sm:flex-row items-center justify-between gap-3 mb-4'>
        <div className='relative w-full sm:w-80'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400' />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder='Search certificate no or name...'
            className='pl-9 h-10'
          />
        </div>

        <div className='flex items-center gap-2 w-full sm:w-auto'>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className='w-[130px] h-10 text-xs'>
              <SelectValue placeholder='Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='ALL'>All Statuses</SelectItem>
              <SelectItem value='ACTIVE'>Active</SelectItem>
              <SelectItem value='REVOKED'>Revoked</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className='w-[150px] h-10 text-xs'>
              <SelectValue placeholder='Certificate Type' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='ALL'>All Types</SelectItem>
              <SelectItem value='VOLUNTEER'>Volunteer</SelectItem>
              <SelectItem value='INTERNSHIP'>Internship</SelectItem>
              <SelectItem value='TRAINING'>Training</SelectItem>
              <SelectItem value='WORKSHOP'>Workshop</SelectItem>
              <SelectItem value='SERVICE'>Service</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Certificates Data Table */}
      <div className='bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left text-xs sm:text-sm'>
            <thead className='bg-slate-50 dark:bg-slate-800/80 border-b text-slate-600 dark:text-slate-300 font-semibold'>
              <tr>
                <th className='p-3.5'>Certificate No.</th>
                <th className='p-3.5'>Volunteer</th>
                <th className='p-3.5'>Team</th>
                <th className='p-3.5'>Role</th>
                <th className='p-3.5'>Type</th>
                <th className='p-3.5'>Duration</th>
                <th className='p-3.5'>Status</th>
                <th className='p-3.5'>Issued</th>
                <th className='p-3.5 text-center'>Verifications</th>
                <th className='p-3.5 text-right'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100 dark:divide-slate-800'>
              {isLoading ? (
                <tr>
                  <td colSpan={10} className='p-8 text-center text-slate-400'>
                    Loading certificates...
                  </td>
                </tr>
              ) : certificates.length === 0 ? (
                <tr>
                  <td colSpan={10} className='p-8 text-center text-slate-400'>
                    {canIssueCertificates
                      ? 'No certificates found. Click "Issue Certificate" to create one.'
                      : 'No certificates found.'}
                  </td>
                </tr>
              ) : (
                certificates.map((cert) => (
                  <tr
                    key={cert.id}
                    className='hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors'
                  >
                    <td className='p-3.5 font-mono font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap'>
                      {cert.certificateNumber}
                    </td>
                    <td className='p-3.5 whitespace-nowrap'>
                      <div className='flex items-center gap-2.5'>
                        <Avatar className='h-8 w-8 border'>
                          {cert.volunteer.profilePictureUrl && (
                            <AvatarImage
                              src={cert.volunteer.profilePictureUrl}
                              alt={cert.volunteer.fullName}
                            />
                          )}
                          <AvatarFallback className='text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'>
                            {getInitials(cert.volunteer.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className='font-semibold text-slate-800 dark:text-slate-200'>
                          {cert.volunteer.fullName}
                        </span>
                      </div>
                    </td>
                    <td className='p-3.5 text-slate-600 dark:text-slate-300 font-medium'>
                      {cert.teamName || '—'}
                    </td>
                    <td className='p-3.5 text-slate-600 dark:text-slate-300'>
                      {cert.role}
                    </td>
                    <td className='p-3.5'>
                      <Badge
                        variant='outline'
                        className='text-[10px] uppercase font-medium'
                      >
                        {cert.certificateType}
                      </Badge>
                    </td>
                    <td className='p-3.5 text-slate-600 dark:text-slate-300 whitespace-nowrap'>
                      {cert.duration}
                    </td>
                    <td className='p-3.5'>
                      {cert.status === 'ACTIVE' ? (
                        <Badge
                          variant='outline'
                          className='bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                        >
                          ACTIVE
                        </Badge>
                      ) : (
                        <Badge
                          variant='outline'
                          className='bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-300 dark:border-red-800'
                        >
                          REVOKED
                        </Badge>
                      )}
                    </td>
                    <td className='p-3.5 text-slate-500 whitespace-nowrap'>
                      {new Date(cert.issuedAt).toLocaleDateString()}
                    </td>
                    <td className='p-3.5 text-center font-mono font-medium'>
                      {cert.verificationCount}
                    </td>
                    <td className='p-3.5 text-right'>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                            <MoreVertical className='h-4 w-4 text-slate-500' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end' className='w-48 text-xs'>
                          <DropdownMenuItem
                            onClick={() => handlePreview(cert)}
                            className='gap-2 cursor-pointer'
                          >
                            <Printer className='h-3.5 w-3.5 text-emerald-600' />
                            Preview & Print
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => handlePreview(cert)}
                            className='gap-2 cursor-pointer'
                          >
                            <Download className='h-3.5 w-3.5 text-emerald-600' />
                            Download PDF
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => {
                              const verifyUrl = cert.verificationCode
                                ? `/verify?code=${encodeURIComponent(cert.verificationCode)}`
                                : `/verify`
                              window.open(verifyUrl, '_blank')
                            }}
                            className='gap-2 cursor-pointer'
                          >
                            <ExternalLink className='h-3.5 w-3.5 text-slate-500' />
                            View Verification Page
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedCertForLogs(cert)
                              setIsLogsOpen(true)
                            }}
                            className='gap-2 cursor-pointer'
                          >
                            <History className='h-3.5 w-3.5 text-blue-600' />
                            Verification Logs
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedCertForRegenerate(cert)
                              setIsRegenerateOpen(true)
                            }}
                            className='gap-2 cursor-pointer'
                          >
                            <RefreshCw className='h-3.5 w-3.5 text-amber-600' />
                            Regenerate Code
                          </DropdownMenuItem>

                          {cert.status === 'ACTIVE' && (
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedCertForRevoke(cert)
                                setIsRevokeOpen(true)
                              }}
                              className='gap-2 text-red-600 cursor-pointer'
                            >
                              <Ban className='h-3.5 w-3.5' />
                              Revoke Certificate
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialogs */}
      {canIssueCertificates && (
        <IssueCertificateDialog
          open={isIssueOpen}
          onOpenChange={setIsIssueOpen}
          onSuccess={(cert, rawToken) => {
            handlePreview(cert, rawToken)
          }}
        />
      )}

      <CertificatePreviewDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        data={previewData}
      />

      <RevokeCertificateDialog
        open={isRevokeOpen}
        onOpenChange={setIsRevokeOpen}
        certificate={selectedCertForRevoke}
      />

      <RegenerateCodeDialog
        open={isRegenerateOpen}
        onOpenChange={setIsRegenerateOpen}
        certificate={selectedCertForRegenerate}
        onPrintUpdated={(cert, newCode) => {
          handlePreview(cert, newCode)
        }}
      />

      <VerificationLogsDialog
        open={isLogsOpen}
        onOpenChange={setIsLogsOpen}
        certificate={selectedCertForLogs}
      />
    </Main>
  )
}
