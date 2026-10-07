import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/ui/shadcn/dialog'
import { Button } from '@/ui/shadcn/button'
import {
  useRegenerateCertificateCode,
  AdminCertificateResponse,
} from '@/query/certificates/use-certificates'
import { RefreshCw, Copy, Check, AlertTriangle, Printer, Loader2 } from 'lucide-react'

interface RegenerateCodeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  certificate: AdminCertificateResponse | null
  onPrintUpdated: (cert: AdminCertificateResponse, newCode: string) => void
}

export const RegenerateCodeDialog: React.FC<RegenerateCodeDialogProps> = ({
  open,
  onOpenChange,
  certificate,
  onPrintUpdated,
}) => {
  const [newCode, setNewCode] = useState<string | null>(null)
  const [hasCopied, setHasCopied] = useState(false)
  const regenerateMutation = useRegenerateCertificateCode()

  if (!certificate) return null

  const handleRegenerate = () => {
    regenerateMutation.mutate(certificate.id, {
      onSuccess: (res: any) => {
        setNewCode(res.data.verificationCode)
      },
    })
  }

  const handleCopy = () => {
    if (!newCode) return
    navigator.clipboard.writeText(newCode)
    setHasCopied(true)
    setTimeout(() => setHasCopied(false), 2000)
  }

  const handleClose = () => {
    setNewCode(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='max-w-md'>
        {!newCode ? (
          <>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2 text-amber-600 dark:text-amber-400'>
                <RefreshCw className='h-5 w-5' />
                Regenerate Verification Code
              </DialogTitle>
              <DialogDescription className='text-xs text-slate-500'>
                If the verification code was compromised or lost, you can invalidate the current code and generate a new random token.
              </DialogDescription>
            </DialogHeader>

            <div className='p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border text-xs space-y-1 my-2'>
              <div>
                <span className='text-slate-500'>Certificate Number:</span>{' '}
                <span className='font-mono font-bold'>{certificate.certificateNumber}</span>
              </div>
              <div>
                <span className='text-slate-500'>Volunteer:</span>{' '}
                <span className='font-semibold'>{certificate.volunteer.fullName}</span>
              </div>
            </div>

            <div className='flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-lg text-amber-800 dark:text-amber-300 text-xs'>
              <AlertTriangle className='h-4 w-4 shrink-0 mt-0.5' />
              <span>
                <strong>Warning:</strong> The old verification code and QR code on printed certificates will immediately stop functioning.
              </span>
            </div>

            <div className='flex justify-end gap-2 pt-2 border-t'>
              <Button type='button' variant='outline' onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type='button'
                onClick={handleRegenerate}
                disabled={regenerateMutation.isPending}
                className='bg-amber-600 hover:bg-amber-700 text-white'
              >
                {regenerateMutation.isPending ? (
                  <>
                    <Loader2 className='h-4 w-4 animate-spin mr-1.5' />
                    Regenerating...
                  </>
                ) : (
                  'Confirm & Regenerate Code'
                )}
              </Button>
            </div>
          </>
        ) : (
          /* CODE REVEAL */
          <div className='space-y-4 py-2'>
            <DialogHeader>
              <DialogTitle className='text-emerald-600 dark:text-emerald-400 flex items-center gap-2'>
                <Check className='h-5 w-5' />
                New Verification Code Generated
              </DialogTitle>
              <DialogDescription className='text-xs text-slate-500'>
                The previous code was permanently invalidated. Please copy and preserve the new code below:
              </DialogDescription>
            </DialogHeader>

            <div className='flex items-center gap-2'>
              <code className='flex-1 p-2.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded font-mono text-xs font-bold text-emerald-900 dark:text-emerald-200 break-all select-all'>
                {newCode}
              </code>
              <Button
                type='button'
                size='sm'
                variant='outline'
                onClick={handleCopy}
                className='shrink-0 h-10 gap-1 text-xs'
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

            <div className='flex justify-end gap-2 pt-2 border-t'>
              <Button type='button' variant='outline' onClick={handleClose}>
                Close
              </Button>
              <Button
                type='button'
                onClick={() => {
                  onPrintUpdated(certificate, newCode)
                  handleClose()
                }}
                className='bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5'
              >
                <Printer className='h-4 w-4' />
                Print Updated Certificate
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
