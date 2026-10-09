import { ExternalLink, FileText } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import type { OrganizationProfile } from '@/schemas/auth/organization-profile'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/ui/shadcn/dialog'

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

  const documents = organization.verificationDocuments?.length
    ? organization.verificationDocuments
    : organization.verificationDocumentUrl
      ? [
          {
            id: organization.verificationDocumentId ?? '',
            url: organization.verificationDocumentUrl,
          },
        ]
      : []
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

          {documents.length ? (
            <div className='space-y-2'>
              <p className='font-medium text-foreground'>
                Supporting documents
              </p>
              {documents.map((document, index) => (
                <div key={`${document.id}-${index}`} className='space-y-1'>
                  {open ? <DocumentPreview url={document.url} /> : null}
                  <a
                    href={document.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center gap-1.5 text-primary underline-offset-4 hover:underline'
                  >
                    Open document {index + 1}
                    <ExternalLink className='h-3.5 w-3.5' />
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className='text-muted-foreground'>No document URL on file.</p>
          )}
          {organization.verificationAdminMessage ? (
            <div className='space-y-2'>
              <p className='font-medium text-foreground'>
                Message from administrator
              </p>
              <div className='whitespace-pre-wrap rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-950'>
                {organization.verificationAdminMessage}
              </div>
            </div>
          ) : null}

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
