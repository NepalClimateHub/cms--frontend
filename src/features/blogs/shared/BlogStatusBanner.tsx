import type { FC } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/ui/shadcn/alert'
import { Badge } from '@/ui/shadcn/badge'
import {
  type BlogState,
  type BlogStateTone,
  getBlogStateView,
} from './blog-status'

const BADGE_VARIANT = {
  draft: 'secondary',
  review: 'outline',
  published: 'default',
  rejected: 'destructive',
} as const satisfies Record<BlogStateTone, string>

export const BlogStatusBanner: FC<{ blogState: BlogState }> = ({
  blogState,
}) => {
  const view = getBlogStateView({ status: blogState.status })
  return (
    <Alert
      role='status'
      variant={view.tone === 'rejected' ? 'destructive' : 'default'}
    >
      <AlertTitle className='flex items-center gap-2'>
        Current state
        <Badge variant={BADGE_VARIANT[view.tone]}>{view.label}</Badge>
      </AlertTitle>
      <AlertDescription>
        {view.description}
        {view.tone === 'rejected' && blogState.reviewFeedback
          ? ` Feedback: ${blogState.reviewFeedback}`
          : ''}
      </AlertDescription>
    </Alert>
  )
}
