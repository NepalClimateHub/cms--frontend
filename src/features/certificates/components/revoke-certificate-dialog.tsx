import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/ui/shadcn/dialog'
import { Button } from '@/ui/shadcn/button'
import { useRevokeCertificate, AdminCertificateResponse } from '@/query/certificates/use-certificates'
import { AlertTriangle, Loader2 } from 'lucide-react'

interface RevokeCertificateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  certificate: AdminCertificateResponse | null
}

export const RevokeCertificateDialog: React.FC<RevokeCertificateDialogProps> = ({
  open,
  onOpenChange,
  certificate,
}) => {
  const [reason, setReason] = useState('')
  const revokeMutation = useRevokeCertificate()

  if (!certificate) return null

  const handleRevoke = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) return

    revokeMutation.mutate(
      { id: certificate.id, reason: reason.trim() },
      {
        onSuccess: () => {
          setReason('')
          onOpenChange(false)
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-red-600 dark:text-red-400'>
            <AlertTriangle className='h-5 w-5' />
            Revoke Certificate
          </DialogTitle>
          <DialogDescription className='text-xs text-slate-500'>
            Revoking this certificate will immediately mark it invalid. Public verifiers will display a revoked notice.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleRevoke} className='space-y-4 text-xs sm:text-sm mt-2'>
          <div className='p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border text-xs space-y-1'>
            <div>
              <span className='text-slate-500'>Certificate Number:</span>{' '}
              <span className='font-mono font-bold'>{certificate.certificateNumber}</span>
            </div>
            <div>
              <span className='text-slate-500'>Volunteer:</span>{' '}
              <span className='font-semibold'>{certificate.volunteer.fullName}</span>
            </div>
          </div>

          <div>
            <label className='block font-semibold mb-1 text-slate-700 dark:text-slate-300'>
              Revocation Reason *
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder='e.g. Certificate issued in error, or service concluded prematurely'
              className='w-full p-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500'
            />
          </div>

          <div className='flex justify-end gap-2 pt-2 border-t'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={revokeMutation.isPending || !reason.trim()}
              className='bg-red-600 hover:bg-red-700 text-white'
            >
              {revokeMutation.isPending ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin mr-1.5' />
                  Revoking...
                </>
              ) : (
                'Revoke Certificate'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
