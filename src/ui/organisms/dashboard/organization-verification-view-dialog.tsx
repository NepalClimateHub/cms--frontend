import { ExternalLink, FileText } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import type { OrganizationProfile } from '@/schemas/auth/organization-profile'
import { VerificationConversation } from '@/ui/molecules/verification-conversation'
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[90vh] max-w-lg flex-col overflow-hidden p-0'>
        <DialogHeader className='shrink-0 px-6 pt-6'>
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

        <div className='min-h-0 flex-1 space-y-4 overflow-y-auto px-6 pb-6 text-sm'>
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
          <VerificationConversation
            messages={organization.verificationMessages}
          />
        </div>
        {footer ? <div className='shrink-0 px-6 pb-6'>{footer}</div> : null}
      </DialogContent>
    </Dialog>
  )
}
