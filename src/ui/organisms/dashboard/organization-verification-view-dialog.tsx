import { useState, type ReactNode } from 'react'
import type { OrganizationProfile } from '@/schemas/auth/organization-profile'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/ui/shadcn/dialog'
import { ExternalLink, FileText } from 'lucide-react'

type OrganizationVerificationViewDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  organization: OrganizationProfile
  /** e.g. admin user list: different helper copy */
  adminView?: boolean
  /** Extra actions (e.g. verify button for admins) */
  footer?: ReactNode
}

function DocumentPreview({ url }: { url: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) return null
  return (
    <a
      href={url}
      target='_blank'
      rel='noopener noreferrer'
      className='block overflow-hidden rounded-md border bg-muted/30'
    >
      <img
        src={url}
        alt='Verification document'
        className='max-h-64 w-full object-contain'
        onError={() => setFailed(true)}
      />
    </a>
  )
}

export default function OrganizationVerificationViewDialog({
  open,
  onOpenChange,
  organization,
  adminView = false,
  footer,
}: OrganizationVerificationViewDialogProps) {
  const submittedAt = organization.verificationRequestedAt
    ? new Date(organization.verificationRequestedAt).toLocaleString()
    : null

  const docUrl = organization.verificationDocumentUrl
  const remarks = organization.verificationRequestRemarks?.trim()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] max-w-lg overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <FileText className='h-5 w-5' />
            Verification application
          </DialogTitle>
          <DialogDescription>
            {adminView
              ? 'Review this organization’s verification request and supporting material.'
              : 'Details you submitted for organization verification.'}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 text-sm'>
          {submittedAt ? (
            <div>
              <p className='font-medium text-foreground'>Submitted</p>
              <p className='text-muted-foreground'>{submittedAt}</p>
            </div>
          ) : null}

          {docUrl ? (
            <div className='space-y-2'>
              <p className='font-medium text-foreground'>Supporting document</p>
              {open ? <DocumentPreview url={docUrl} /> : null}
              <a
                href={docUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-1.5 text-primary underline-offset-4 hover:underline'
              >
                Open document link
                <ExternalLink className='h-3.5 w-3.5' />
              </a>
              {organization.verificationDocumentId ? (
                <p className='text-xs text-muted-foreground'>
                  File ID: {organization.verificationDocumentId}
                </p>
              ) : null}
            </div>
          ) : (
            <p className='text-muted-foreground'>No document URL on file.</p>
          )}

          {remarks ? (
            <div className='space-y-2'>
              <p className='font-medium text-foreground'>
                Message to administrators
              </p>
              <div className='whitespace-pre-wrap rounded-md border bg-muted/30 p-3 text-muted-foreground'>
                {remarks}
              </div>
            </div>
          ) : (
            <p className='text-muted-foreground'>No message was provided.</p>
          )}
        </div>
        {footer}
      </DialogContent>
    </Dialog>
  )
}
