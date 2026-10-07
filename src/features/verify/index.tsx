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
  XCircle,
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
} from 'lucide-react'

interface VerifyPageProps {
  initialCode?: string
}

export default function CertificateVerificationPage({
  initialCode = '',
}: VerifyPageProps) {
  const [code, setCode] = useState(initialCode)
  const [result, setResult] = useState<PublicVerificationResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const verifyMutation = useVerifyCertificate()

  const executeVerification = (codeToVerify: string) => {
    const cleanCode = codeToVerify.trim().toUpperCase()
    if (!cleanCode) {
      setErrorMessage('Please enter a valid verification code.')
      return
    }

    setErrorMessage(null)
    setResult(null)

    verifyMutation.mutate(cleanCode, {
      onSuccess: (data) => {
        setResult(data)
      },
      onError: (err: any) => {
        setErrorMessage(
          err?.message ||
            'We couldn’t verify the certificate right now. Please try again later.',
        )
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
  }, [initialCode])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    executeVerification(code)
  }

  const handleReset = () => {
    setCode('')
    setResult(null)
    setErrorMessage(null)
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
    <div className='min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/40 to-slate-100 dark:from-slate-950 dark:via-emerald-950/20 dark:to-slate-900 flex flex-col items-center justify-between p-4 sm:p-6 lg:p-8 font-sans'>
      {/* Top Header */}
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
            onError={(e) => {
              // Graceful fallback if logo fails
              e.currentTarget.style.display = 'none'
            }}
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

      {/* Main Verification Card */}
      <main className='w-full max-w-xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 transition-all'>
        {/* Verification Form (Always visible or compact when result shown) */}
        {!result && (
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
                  placeholder='e.g. 7F3A91C2-4D8E-4B71-A6F2-91C83E5D7A42'
                  className='font-mono text-center tracking-wider text-sm sm:text-base h-12 uppercase pr-10 border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20'
                  disabled={verifyMutation.isPending}
                  autoComplete='off'
                  spellCheck={false}
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
                Enter the unique 36-character UUID code printed on the NCH certificate or scanned via QR code.
              </p>
            </div>

            {errorMessage && (
              <div
                role='alert'
                className='flex items-start gap-3 p-3.5 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-300 text-xs sm:text-sm'
              >
                <AlertTriangle className='h-4 w-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400' />
                <span>{errorMessage}</span>
              </div>
            )}

            <Button
              type='submit'
              id='verify-submit-button'
              disabled={verifyMutation.isPending || !code.trim()}
              className='w-full h-12 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium text-sm sm:text-base shadow-md transition-all flex items-center justify-center gap-2'
            >
              {verifyMutation.isPending ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  Verifying certificate...
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

        {/* VERIFIED SUCCESS STATE */}
        {result && result.valid && result.certificate && (
          <div className='space-y-6 animate-in fade-in zoom-in-95 duration-300'>
            {/* Status Banner */}
            <div className='flex flex-col items-center text-center p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60'>
              <div className='h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2 ring-8 ring-emerald-50/50 dark:ring-emerald-950/30'>
                <CheckCircle2 className='h-7 w-7' />
              </div>
              <div className='flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-extrabold text-lg sm:text-xl tracking-wide'>
                ✓ VERIFIED
              </div>
              <p className='text-xs sm:text-sm text-emerald-800/80 dark:text-emerald-200/80 font-medium mt-0.5'>
                Certificate is authentic
              </p>
            </div>

            {/* Profile & Name */}
            <div className='flex flex-col items-center text-center pt-2'>
              <Avatar className='h-20 w-20 sm:h-24 sm:w-24 border-4 border-white dark:border-slate-800 shadow-md ring-2 ring-emerald-500/20'>
                {result.certificate.profilePicture && (
                  <AvatarImage
                    src={result.certificate.profilePicture}
                    alt={result.certificate.name}
                    className='object-cover'
                  />
                )}
                <AvatarFallback className='bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 font-bold text-lg sm:text-xl'>
                  {getInitials(result.certificate.name)}
                </AvatarFallback>
              </Avatar>

              <h2 className='text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-3'>
                {result.certificate.name}
              </h2>
              <div className='inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5'>
                <span>{result.certificate.role}</span>
                <span>•</span>
                <span>{result.certificate.organization}</span>
              </div>
            </div>

            {/* Certificate Details Grid */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2'>
              <div className='p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60'>
                <div className='flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1'>
                  <Calendar className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400' />
                  Joined Date
                </div>
                <div className='text-sm font-medium text-slate-800 dark:text-slate-200'>
                  {formatDate(result.certificate.dateJoined)}
                </div>
              </div>

              <div className='p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60'>
                <div className='flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1'>
                  <Calendar className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400' />
                  Completed Date
                </div>
                <div className='text-sm font-medium text-slate-800 dark:text-slate-200'>
                  {formatDate(result.certificate.dateEnded)}
                </div>
              </div>

              <div className='p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60'>
                <div className='flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1'>
                  <Clock className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400' />
                  Service Duration
                </div>
                <div className='text-sm font-medium text-slate-800 dark:text-slate-200'>
                  {result.certificate.duration}
                </div>
              </div>

              <div className='p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60'>
                <div className='flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1'>
                  <Award className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400' />
                  Certificate Type
                </div>
                <div className='text-sm font-medium text-slate-800 dark:text-slate-200'>
                  {result.certificate.certificateType}
                </div>
              </div>

              <div className='sm:col-span-2 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between'>
                <div>
                  <div className='flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-0.5'>
                    <Hash className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400' />
                    Certificate Number
                  </div>
                  <div className='text-sm font-mono font-medium text-slate-800 dark:text-slate-200'>
                    {result.certificate.certificateNumber}
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

            {/* Official Disclaimer */}
            <div className='p-3 rounded-lg bg-slate-100/70 dark:bg-slate-800/40 text-center text-xs text-slate-500 dark:text-slate-400 leading-relaxed border border-slate-200/50 dark:border-slate-700/40'>
              This verification confirms that the certificate record exists in the Nepal Climate Hub system.
            </div>

            {/* Reset / Check another */}
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

        {/* REVOKED STATE */}
        {result && !result.valid && result.status === 'REVOKED' && (
          <div className='space-y-6 text-center animate-in fade-in zoom-in-95 duration-300 py-4'>
            <div className='h-14 w-14 mx-auto rounded-full bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 ring-8 ring-amber-50 dark:ring-amber-950/30'>
              <AlertTriangle className='h-8 w-8' />
            </div>

            <div>
              <h2 className='text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100'>
                Certificate Revoked
              </h2>
              <p className='text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed max-w-md mx-auto'>
                {result.message ||
                  'This certificate is no longer valid. Please contact Nepal Climate Hub if you have concerns about its legitimacy.'}
              </p>
            </div>

            <div className='p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 text-left space-y-1.5'>
              <div className='font-semibold'>Need help?</div>
              <div>
                If you suspect tampering or need official clarification regarding this revocation, please email us directly:
              </div>
              <a
                href='mailto:info@nepalclimatehub.org'
                className='inline-flex items-center gap-1 font-medium text-amber-900 dark:text-amber-200 underline mt-1'
              >
                <Mail className='h-3.5 w-3.5' /> info@nepalclimatehub.org
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

        {/* NOT FOUND / INVALID STATE */}
        {result && !result.valid && result.status !== 'REVOKED' && (
          <div className='space-y-6 text-center animate-in fade-in zoom-in-95 duration-300 py-4'>
            <div className='h-14 w-14 mx-auto rounded-full bg-red-100 dark:bg-red-950/60 flex items-center justify-center text-red-600 dark:text-red-400 ring-8 ring-red-50 dark:ring-red-950/30'>
              <XCircle className='h-8 w-8' />
            </div>

            <div>
              <h2 className='text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100'>
                Certificate Not Found
              </h2>
              <p className='text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed max-w-md mx-auto'>
                This record doesn't exist. Please email us if you are concerned about the legitimacy of this person's certificate.
              </p>
            </div>

            <div className='p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 text-left space-y-1.5'>
              <div className='font-semibold text-slate-800 dark:text-slate-200'>Common reasons:</div>
              <ul className='list-disc list-inside space-y-1 pl-1 text-slate-500 dark:text-slate-400'>
                <li>The verification code was mistyped or incomplete.</li>
                <li>The certificate was not issued by Nepal Climate Hub.</li>
                <li>The certificate has been superseded by a newly re-issued record.</li>
              </ul>
              <div className='pt-2'>
                <a
                  href='mailto:info@nepalclimatehub.org?subject=Certificate%20Legitimacy%20Inquiry'
                  className='inline-flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400 hover:underline'
                >
                  <Mail className='h-3.5 w-3.5' /> Contact Nepal Climate Hub for assistance
                </a>
              </div>
            </div>

            <Button
              variant='outline'
              onClick={handleReset}
              className='w-full h-11 border-slate-300 dark:border-slate-700 flex items-center justify-center gap-2'
            >
              <RotateCcw className='h-4 w-4' />
              Try Another Code
            </Button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className='w-full max-w-2xl text-center mt-6 text-xs text-slate-500 dark:text-slate-500 flex flex-col items-center gap-2'>
        <p>
          © {new Date().getFullYear()} Nepal Climate Hub. All rights reserved.
        </p>
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
