import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/ui/shadcn/dialog'
import { Badge } from '@/ui/shadcn/badge'
import {
  useGetCertificateLogs,
  AdminCertificateResponse,
} from '@/query/certificates/use-certificates'
import { History, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react'

interface VerificationLogsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  certificate: AdminCertificateResponse | null
}

export const VerificationLogsDialog: React.FC<VerificationLogsDialogProps> = ({
  open,
  onOpenChange,
  certificate,
}) => {
  const { data: logsResponse, isLoading } = useGetCertificateLogs(
    certificate?.id || '',
    open && Boolean(certificate?.id),
  )

  const logs = logsResponse?.data || []

  if (!certificate) return null

  const getResultBadge = (result: string) => {
    if (result === 'SUCCESS') {
      return (
        <Badge variant='outline' className='bg-emerald-50 text-emerald-700 border-emerald-300 gap-1 text-[11px]'>
          <CheckCircle className='h-3 w-3' /> Verified
        </Badge>
      )
    }
    if (result === 'REVOKED') {
      return (
        <Badge variant='outline' className='bg-amber-50 text-amber-700 border-amber-300 gap-1 text-[11px]'>
          <AlertTriangle className='h-3 w-3' /> Revoked Attempt
        </Badge>
      )
    }
    return (
      <Badge variant='outline' className='bg-red-50 text-red-700 border-red-300 gap-1 text-[11px]'>
        <XCircle className='h-3 w-3' /> {result}
      </Badge>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-base font-bold'>
            <History className='h-4 w-4 text-emerald-600' />
            Verification History & Audit Logs
          </DialogTitle>
        </DialogHeader>

        <div className='text-xs text-slate-500 mb-2'>
          Verification audit records for Certificate{' '}
          <strong className='text-slate-800 dark:text-slate-200 font-mono'>
            {certificate.certificateNumber}
          </strong>{' '}
          ({certificate.volunteer.fullName})
        </div>

        <div className='max-h-[60vh] overflow-y-auto border rounded-lg'>
          {isLoading ? (
            <div className='p-8 text-center text-xs text-slate-400'>Loading audit trail...</div>
          ) : logs.length === 0 ? (
            <div className='p-8 text-center text-xs text-slate-400'>
              No verification attempts recorded for this certificate yet.
            </div>
          ) : (
            <table className='w-full text-left text-xs'>
              <thead className='bg-slate-50 dark:bg-slate-800/80 border-b font-semibold text-slate-600 dark:text-slate-300'>
                <tr>
                  <th className='p-2.5'>Timestamp</th>
                  <th className='p-2.5'>Result</th>
                  <th className='p-2.5'>IP Hash</th>
                  <th className='p-2.5'>User Agent</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100 dark:divide-slate-800'>
                {logs.map((log) => (
                  <tr key={log.id} className='hover:bg-slate-50/50 dark:hover:bg-slate-800/40'>
                    <td className='p-2.5 whitespace-nowrap text-slate-700 dark:text-slate-300 flex items-center gap-1.5'>
                      <Clock className='h-3 w-3 text-slate-400' />
                      {new Date(log.requestedAt).toLocaleString()}
                    </td>
                    <td className='p-2.5 whitespace-nowrap'>{getResultBadge(log.result)}</td>
                    <td className='p-2.5 font-mono text-[11px] text-slate-500'>
                      {log.ipHash ? `${log.ipHash.substring(0, 12)}...` : 'N/A'}
                    </td>
                    <td className='p-2.5 text-slate-500 max-w-[200px] truncate' title={log.userAgent || ''}>
                      {log.userAgent || 'Unknown'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
