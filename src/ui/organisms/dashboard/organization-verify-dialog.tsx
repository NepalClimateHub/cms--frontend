import { useEffect, useState } from 'react'
import ImageUpload from '@/ui/image-upload'
import { Button } from '@/ui/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/ui/shadcn/dialog'
import { Label } from '@/ui/shadcn/label'
import { Textarea } from '@/ui/shadcn/textarea'
import { Loader2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import type { OrganizationProfile } from '@/schemas/auth/organization-profile'
import {
  usePatchMyOrganization,
  type UpdateMyOrganizationBody,
} from '@/query/users/use-my-organization'

const REMARKS_PLACEHOLDER = `Dear Admin,

Please consider verifying our organization for the Nepal Climate Hub. We have attached our registration or supporting document below.

Thank you for your time.`

type OrganizationVerifyDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  organization: OrganizationProfile
  onSubmitted: () => void
}

export default function OrganizationVerifyDialog({
  open,
  onOpenChange,
  organization,
  onSubmitted,
}: OrganizationVerifyDialogProps) {
  const patchOrg = usePatchMyOrganization()
  const [docUrl, setDocUrl] = useState<string | null>(null)
  const [docId, setDocId] = useState<string | null>(null)
  const [remarks, setRemarks] = useState('')

  useEffect(() => {
    if (open) {
      setDocUrl(organization.verificationDocumentUrl)
      setDocId(organization.verificationDocumentId)
      setRemarks(organization.verificationRequestRemarks ?? '')
    }
  }, [open, organization])

  const handleSubmit = () => {
    if (!docId || !docUrl) {
      toast({
        title: 'Document required',
        description: 'Please upload a verification image or document.',
        variant: 'destructive',
      })
      return
    }

    const body: UpdateMyOrganizationBody = {
      verificationDocumentUrl: docUrl,
      verificationDocumentId: docId,
      verificationRequestRemarks: remarks.trim() || undefined,
    }

    patchOrg.mutate(body, {
      onSuccess: () => {
        toast({
          title: 'Verification request sent',
          description: 'An administrator will review your submission.',
        })
        onOpenChange(false)
        onSubmitted()
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Request organization verification</DialogTitle>
          <DialogDescription>
            Upload a clear image of your registration certificate or other
            supporting document. Add a short note for the admin team.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <ImageUpload
            label='Verification document (image)'
            handleImage={(id, url) => {
              setDocId(id)
              setDocUrl(url)
            }}
            initialImageId={docId}
            initialImageUrl={docUrl}
            inputId='org-verification-doc-upload'
          />

          <div className='space-y-2'>
            <Label htmlFor='org-verify-remarks'>Message to administrators</Label>
            <Textarea
              id='org-verify-remarks'
              rows={6}
              placeholder={REMARKS_PLACEHOLDER}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className='resize-y'
            />
          </div>

          <div className='flex justify-end gap-2 pt-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={patchOrg.isPending}
            >
              Cancel
            </Button>
            <Button
              type='button'
              onClick={handleSubmit}
              disabled={patchOrg.isPending || !docId}
            >
              {patchOrg.isPending ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Submitting…
                </>
              ) : (
                'Submit request'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
