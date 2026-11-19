import React, { useEffect, useState, useTransition } from 'react'
import {
  useVerifyCertificate,
  PublicVerificationResponse,
} from '@/query/certificates/use-certificates'
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/shadcn/avatar'
import { Badge } from '@/ui/shadcn/badge'
import { Button } from '@/ui/shadcn/button'
import { Input } from '@/ui/shadcn/input'
import {
  CheckCircle2,
  AlertTriangle,
  Search,
  RotateCcw,
  ShieldCheck,
  Calendar,
  Clock,
  Award,
  Hash,
  Mail,
  Loader2,
  ExternalLink,
  Users,
  FileX2,
  Ban,
} from 'lucide-react'

// The four possible UI states after a verification attempt
type VerifyState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'success'; data: PublicVerificationResponse }
  | { kind: 'revoked'; message?: string }
  | { kind: 'not_found'; submittedCode: string }
  | { kind: 'api_error'; message: string }

interface VerifyPageProps {
  initialCode?: string
}

export default function CertificateVerificationPage({
  initialCode = '',
}: VerifyPageProps) {
  const [code, setCode] = useState(initialCode)
  const [state, setState] = useState<VerifyState>({ kind: 'idle' })
  const [, startTransition] = useTransition()

  const verifyMutation = useVerifyCertificate()

  const executeVerification = (codeToVerify: string) => {
    const cleanCode = codeToVerify.trim().toUpperCase()
    if (!cleanCode) {
      setState({ kind: 'api_error', message: 'Please enter a valid verification code.' })
      return
    }

    setState({ kind: 'loading' })

    verifyMutation.mutate(cleanCode, {
      onSuccess: (data) => {
        // Guard against unexpected API response shapes
        if (!data || typeof data.valid !== 'boolean') {
          setState({ kind: 'not_found', submittedCode: cleanCode })
          return
        }
        if (data.valid && data.certificate) {
          setState({ kind: 'success', data })
        } else if (data.status === 'REVOKED') {
          setState({ kind: 'revoked', message: data.message })
        } else {
          setState({ kind: 'not_found', submittedCode: cleanCode })
        }
      },
      onError: (err: any) => {
        const message =
          err?.message ||
          'We couldn\'t connect to the verification server. Please check your connection and try again.'
        setState({ kind: 'api_error', message })
      },
    })
  }

  // Auto-submit if code is provided via QR code query parameter on mount
  useEffect(() => {
    if (initialCode) {
      startTransition(() => {
        setCode(initialCode)
        executeVerification(initialCode)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    executeVerification(code)
  }

  const handleReset = () => {
    setCode('')
    setState({ kind: 'idle' })
  }

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Present'
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  const getInitials = (name: string) =>
    name
      .split(' ')
      .filter(Boolean)
      .map((p) => p[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)

  // Derive booleans for readability
  const showForm = state.kind === 'idle' || state.kind === 'api_error'
  const isLoading = state.kind === 'loading' || verifyMutation.isPending

  return (
    <div className='min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/40 to-slate-100 dark:from-slate-950 dark:via-emerald-950/20 dark:to-slate-900 flex flex-col items-center justify-between p-4 sm:p-6 lg:p-8 font-sans'>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className='w-full max-w-2xl flex flex-col items-center text-center mt-4 sm:mt-8 mb-6'>
        <a
          href='https://nepalclimatehub.org'
          target='_blank'
          rel='noopener noreferrer'
          className='flex items-center gap-3 group transition-transform hover:scale-105 mb-4'
        >
          <img
            src='/images/logo.png'
            alt='Nepal Climate Hub Logo'
            className='h-14 sm:h-16 w-auto object-contain drop-shadow-sm'
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        </a>

        <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 dark:bg-emerald-950/80 border border-emerald-300/60 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2 shadow-sm'>
          <ShieldCheck className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400' />
          Official Verification Portal
        </div>

        <h1 className='text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight'>
          Certificate Verification
        </h1>
        <p className='text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1 max-w-md'>
          Verify the authenticity of a Nepal Climate Hub certificate.
        </p>
      </header>

      {/* ── Main card ─────────────────────────────────────────────────────── */}
      <main className='w-full max-w-xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 transition-all'>

        {/* ── INPUT FORM ── shown in idle + api_error states */}
        {showForm && (
          <form onSubmit={handleSubmit} className='space-y-5'>
            <div>
              <label
                htmlFor='verification-code-input'
                className='block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2'
              >
                Verification Code
              </label>
              <div className='relative'>
                <Input
                  id='verification-code-input'
                  type='text'
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder='e.g. 8K4N9M2P7X1V5Q3T'
                  className='font-mono text-center tracking-wider text-sm sm:text-base h-12 uppercase pr-10 border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20'
                  disabled={isLoading}
                  autoComplete='off'
                  spellCheck={false}
                  autoFocus
                />
                {code && (
                  <button
                    type='button'
                    onClick={() => setCode('')}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold'
                    title='Clear'
                  >
                    ✕
                  </button>
                )}
              </div>
              <p className='text-xs text-slate-500 dark:text-slate-400 mt-2'>
                Enter the unique verification code printed on the NCH certificate or scanned via QR code.
              </p>
            </div>

            {/* Inline error for generic API failures */}
            {state.kind === 'api_error' && (
              <div
                role='alert'
                className='flex items-start gap-3 p-3.5 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-300 text-xs sm:text-sm animate-in fade-in slide-in-from-top-1 duration-200'
              >
                <AlertTriangle className='h-4 w-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400' />
                <span>{state.message}</span>
              </div>
            )}

            <Button
              type='submit'
              disabled={isLoading || !code.trim()}
              className='w-full h-12 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium text-sm sm:text-base shadow-md transition-all flex items-center justify-center gap-2'
            >
              {isLoading ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  Verifying certificate…
                </>
              ) : (
                <>
                  <Search className='h-4 w-4' />
                  Verify Certificate
                </>
              )}
            </Button>
          </form>
        )}

        {/* ── LOADING SPINNER (while mutation pending and state transitions) */}
        {state.kind === 'loading' && (
          <div className='flex flex-col items-center justify-center gap-4 py-12 animate-in fade-in duration-200'>
            <div className='h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center ring-8 ring-emerald-50 dark:ring-emerald-950/30'>
              <Loader2 className='h-7 w-7 text-emerald-600 dark:text-emerald-400 animate-spin' />
            </div>
            <p className='text-sm font-medium text-slate-600 dark:text-slate-400'>
              Verifying certificate…
            </p>
          </div>
        )}

        {/* ── SUCCESS STATE ── */}
        {state.kind === 'success' && state.data.certificate && (
          <div className='space-y-6 animate-in fade-in zoom-in-95 duration-300'>
            {/* Status Banner */}
            <div className='flex flex-col items-center text-center p-5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60'>
              <div className='h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3 ring-8 ring-emerald-50/50 dark:ring-emerald-950/30'>
                <CheckCircle2 className='h-8 w-8' />
              </div>
              <div className='text-emerald-700 dark:text-emerald-300 font-extrabold text-xl sm:text-2xl tracking-wide'>
                ✓ VERIFIED
              </div>
              <p className='text-xs sm:text-sm text-emerald-800/80 dark:text-emerald-200/80 font-medium mt-1'>
                This certificate is authentic and issued by Nepal Climate Hub.
              </p>
            </div>

            {/* Profile & Name */}
            <div className='flex flex-col items-center text-center'>
              <Avatar className='h-20 w-20 sm:h-24 sm:w-24 border-4 border-white dark:border-slate-800 shadow-md ring-2 ring-emerald-500/20'>
                {state.data.certificate.profilePicture && (
                  <AvatarImage
                    src={state.data.certificate.profilePicture}
                    alt={state.data.certificate.name}
                    className='object-cover'
                  />
                )}
                <AvatarFallback className='bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 font-bold text-lg sm:text-xl'>
                  {getInitials(state.data.certificate.name)}
                </AvatarFallback>
              </Avatar>
              <h2 className='text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-3'>
                {state.data.certificate.name}
              </h2>
              <div className='inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5'>
                <span>{state.data.certificate.role}</span>
                <span>•</span>
                <span>{state.data.certificate.organization}</span>
              </div>
            </div>

            {/* Details Grid */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <div className='p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60'>
                <div className='flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1'>
                  <Calendar className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400' />
                  Joined Date
                </div>
                <div className='text-sm font-medium text-slate-800 dark:text-slate-200'>
                  {formatDate(state.data.certificate.dateJoined)}
                </div>
              </div>

              <div className='p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60'>
                <div className='flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1'>
                  <Calendar className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400' />
                  Completed Date
                </div>
                <div className='text-sm font-medium text-slate-800 dark:text-slate-200'>
                  {formatDate(state.data.certificate.dateEnded)}
                </div>
              </div>

              <div className='p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60'>
                <div className='flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1'>
                  <Clock className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400' />
                  Service Duration
                </div>
                <div className='text-sm font-medium text-slate-800 dark:text-slate-200'>
                  {state.data.certificate.duration}
                </div>
              </div>

              <div className='p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60'>
                <div className='flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1'>
                  <Award className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400' />
                  Certificate Type
                </div>
                <div className='text-sm font-medium text-slate-800 dark:text-slate-200'>
                  {state.data.certificate.certificateType}
                </div>
              </div>

              {state.data.certificate.teamName && (
                <div className='p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60'>
                  <div className='flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1'>
                    <Users className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400' />
                    Team
                  </div>
                  <div className='text-sm font-medium text-slate-800 dark:text-slate-200'>
                    {state.data.certificate.teamName}
                  </div>
                </div>
              )}

              {state.data.certificate.issuedAt && (
                <div className='p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60'>
                  <div className='flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1'>
                    <Calendar className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400' />
                    Issued On
                  </div>
                  <div className='text-sm font-medium text-slate-800 dark:text-slate-200'>
                    {formatDate(state.data.certificate.issuedAt)}
                  </div>
                </div>
              )}

              <div className='sm:col-span-2 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between'>
                <div>
                  <div className='flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-0.5'>
                    <Hash className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400' />
                    Certificate Number
                  </div>
                  <div className='text-sm font-mono font-medium text-slate-800 dark:text-slate-200'>
                    {state.data.certificate.certificateNumber}
                  </div>
                </div>
                <Badge
                  variant='outline'
                  className='bg-emerald-100/60 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                >
                  Active Record
                </Badge>
              </div>
            </div>

            <div className='p-3 rounded-lg bg-slate-100/70 dark:bg-slate-800/40 text-center text-xs text-slate-500 dark:text-slate-400 leading-relaxed border border-slate-200/50 dark:border-slate-700/40'>
              This verification confirms that the certificate record exists in the Nepal Climate Hub system.
            </div>

            <Button
              variant='outline'
              onClick={handleReset}
              className='w-full h-11 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-2'
            >
              <RotateCcw className='h-4 w-4' />
              Verify Another Certificate
            </Button>
          </div>
        )}

        {/* ── REVOKED STATE ── */}
        {state.kind === 'revoked' && (
          <div className='space-y-6 animate-in fade-in zoom-in-95 duration-300'>
            {/* Banner */}
            <div className='flex flex-col items-center text-center p-5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60'>
              <div className='h-14 w-14 rounded-full bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center ring-8 ring-amber-50 dark:ring-amber-950/30 mb-3'>
                <Ban className='h-8 w-8 text-amber-600 dark:text-amber-400' />
              </div>
              <div className='font-extrabold text-xl sm:text-2xl text-amber-700 dark:text-amber-300 tracking-wide'>
                Certificate Revoked
              </div>
              <p className='text-sm text-amber-800/80 dark:text-amber-200/80 mt-1 max-w-sm'>
                {state.message ||
                  'This certificate has been officially revoked and is no longer valid.'}
              </p>
            </div>

            {/* Info box */}
            <div className='p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 text-sm text-amber-800 dark:text-amber-300 space-y-2'>
              <p className='font-semibold'>What does this mean?</p>
              <p className='text-xs leading-relaxed text-amber-700 dark:text-amber-400'>
                A revoked certificate is one that Nepal Climate Hub has invalidated. This may happen due to disciplinary action, data correction, or other administrative reasons. The holder should not present this certificate as valid.
              </p>
              <a
                href='mailto:info@nepalclimatehub.org'
                className='inline-flex items-center gap-1.5 text-xs font-medium text-amber-900 dark:text-amber-200 underline underline-offset-2 mt-1'
              >
                <Mail className='h-3.5 w-3.5' />
                Contact us for clarification
              </a>
            </div>

            <Button
              variant='outline'
              onClick={handleReset}
              className='w-full h-11 border-slate-300 dark:border-slate-700 flex items-center justify-center gap-2'
            >
              <RotateCcw className='h-4 w-4' />
              Verify Another Certificate
            </Button>
          </div>
        )}

        {/* ── NOT FOUND STATE ── */}
        {state.kind === 'not_found' && (
          <div className='space-y-6 animate-in fade-in zoom-in-95 duration-300'>
            {/* Banner */}
            <div className='flex flex-col items-center text-center p-5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60'>
              <div className='h-14 w-14 rounded-full bg-red-100 dark:bg-red-900/60 flex items-center justify-center ring-8 ring-red-50 dark:ring-red-950/30 mb-3'>
                <FileX2 className='h-8 w-8 text-red-600 dark:text-red-400' />
              </div>
              <div className='font-extrabold text-xl sm:text-2xl text-red-700 dark:text-red-300 tracking-wide'>
                Certificate Not Found
              </div>
              <p className='text-sm text-red-800/80 dark:text-red-200/80 mt-1 max-w-sm'>
                No certificate record matched{' '}
                <span className='font-mono font-bold break-all'>
                  {state.submittedCode}
                </span>
                . This code does not exist in our system.
              </p>
            </div>

            {/* Common reasons */}
            <div className='p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm space-y-3'>
              <p className='font-semibold text-slate-800 dark:text-slate-200'>Common reasons:</p>
              <ul className='space-y-2 text-xs text-slate-600 dark:text-slate-400'>
                <li className='flex items-start gap-2'>
                  <span className='mt-0.5 shrink-0 h-4 w-4 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-red-600 dark:text-red-400 text-[10px] font-bold'>1</span>
                  The code was mistyped or contains extra spaces — codes are case-insensitive, 16 characters.
                </li>
                <li className='flex items-start gap-2'>
                  <span className='mt-0.5 shrink-0 h-4 w-4 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-red-600 dark:text-red-400 text-[10px] font-bold'>2</span>
                  The certificate was not issued by Nepal Climate Hub and may be fraudulent.
                </li>
                <li className='flex items-start gap-2'>
                  <span className='mt-0.5 shrink-0 h-4 w-4 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-red-600 dark:text-red-400 text-[10px] font-bold'>3</span>
                  The certificate was re-issued with a new code; ask the holder for the updated code.
                </li>
              </ul>
              <div className='pt-1 border-t border-slate-200 dark:border-slate-700'>
                <a
                  href='mailto:info@nepalclimatehub.org?subject=Certificate%20Legitimacy%20Inquiry'
                  className='inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline'
                >
                  <Mail className='h-3.5 w-3.5' />
                  Contact Nepal Climate Hub to report a suspected fraudulent certificate
                </a>
              </div>
            </div>

            {/* Try again with the same code pre-filled */}
            <div className='flex flex-col gap-3'>
              <Button
                onClick={handleReset}
                className='w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2'
              >
                <Search className='h-4 w-4' />
                Try a Different Code
              </Button>
              <Button
                variant='outline'
                onClick={() => {
                  // Re-fill the input with the attempted code so user can correct a typo
                  setCode(state.submittedCode)
                  setState({ kind: 'idle' })
                }}
                className='w-full h-11 border-slate-300 dark:border-slate-700 flex items-center justify-center gap-2 text-sm'
              >
                <RotateCcw className='h-4 w-4' />
                Edit &amp; Re-submit "
                <span className='font-mono font-bold truncate max-w-[160px]'>
                  {state.submittedCode}
                </span>
                "
              </Button>
            </div>
          </div>
        )}

      </main>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className='w-full max-w-2xl text-center mt-6 text-xs text-slate-500 dark:text-slate-500 flex flex-col items-center gap-2'>
        <p>© {new Date().getFullYear()} Nepal Climate Hub. All rights reserved.</p>
        <div className='flex items-center gap-4 text-slate-400 dark:text-slate-600'>
          <a
            href='https://nepalclimatehub.org'
            target='_blank'
            rel='noopener noreferrer'
            className='hover:text-emerald-600 transition-colors inline-flex items-center gap-1'
          >
            nepalclimatehub.org <ExternalLink className='h-3 w-3' />
          </a>
          <span>•</span>
          <a
            href='mailto:info@nepalclimatehub.org'
            className='hover:text-emerald-600 transition-colors'
          >
            info@nepalclimatehub.org
          </a>
        </div>
      </footer>
    </div>
  )
}
