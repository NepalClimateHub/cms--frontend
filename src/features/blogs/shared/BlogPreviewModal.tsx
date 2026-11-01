import { AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { env } from '@/config/env.config'
import { Alert, AlertDescription, AlertTitle } from '@/ui/shadcn/alert'
import { Dialog, DialogContent } from '@/ui/shadcn/dialog'
import { BlogPreviewFrame, type PreviewView } from './BlogPreviewFrame'
import { BlogPreviewToolbar } from './BlogPreviewToolbar'
import { deriveExtras } from './blog-preview-extras'
import {
  buildPreviewPayload,
  type PreviewExtras,
  type PreviewSource,
} from './blog-preview-payload'

type Props = {
  open: boolean
  onClose: () => void
  values: PreviewSource
  extras?: PreviewExtras
}

type NoticeProps = { title: string; description: string }

const Notice = ({ title, description }: NoticeProps) => (
  <Alert variant='destructive' className='mx-auto max-w-xl bg-background'>
    <AlertTriangle className='h-4 w-4' />
    <AlertTitle>{title}</AlertTitle>
    <AlertDescription>{description}</AlertDescription>
  </Alert>
)

export function BlogPreviewModal({ open, onClose, values, extras }: Props) {
  const [view, setView] = useState<PreviewView>('desktop')
  const siteUrl = env.VITE_PUBLIC_SITE_URL
  const { payload, tooLarge } = open
    ? buildPreviewPayload(values, extras ?? deriveExtras(values))
    : { payload: '', tooLarge: false }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className='flex h-[92vh] max-w-[96vw] flex-col gap-0 p-0 sm:max-w-[96vw]'>
        <BlogPreviewToolbar view={view} onViewChange={setView} />
        <div className='min-h-0 flex-1 overflow-auto bg-muted p-4'>
          {!siteUrl ? (
            <Notice
              title='Preview unavailable'
              description='The public site URL is not configured. Set VITE_PUBLIC_SITE_URL at build time to enable previews.'
            />
          ) : tooLarge ? (
            <Notice
              title='Content too large to preview'
              description='This post exceeds the 1 MB preview limit. Reduce embedded images or content size and try again.'
            />
          ) : (
            <BlogPreviewFrame
              action={`${siteUrl}/blog-preview`}
              payload={payload}
              view={view}
              title='Blog preview'
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default BlogPreviewModal
