import type { SaveAction } from './save-gate'

export type BlogStatus = 'DRAFT' | 'UNDER_REVIEW' | 'PUBLISHED' | 'REJECTED'

export type BlogStateTone = 'draft' | 'review' | 'published' | 'rejected'

export type BlogState = {
  status?: BlogStatus
  approvedByAdmin?: boolean
  reviewFeedback?: string
}

export type BlogStateView = {
  tone: BlogStateTone
  label: string
  description: string
}

export type SubmitOutcome = {
  action: SaveAction
  label: string
  hint: string
}

type StateInput = { status?: BlogStatus; isDraft?: boolean }

export const getBlogStateView = ({
  status,
  isDraft,
}: StateInput): BlogStateView => {
  const resolved: BlogStatus = status ?? (isDraft ? 'DRAFT' : 'UNDER_REVIEW')
  switch (resolved) {
    case 'PUBLISHED':
      return {
        tone: 'published',
        label: 'Published',
        description: 'This blog is live. Edits stay live without re-review.',
      }
    case 'UNDER_REVIEW':
      return {
        tone: 'review',
        label: 'Under review',
        description: 'Waiting for admin approval. It is not public yet.',
      }
    case 'REJECTED':
      return {
        tone: 'rejected',
        label: 'Rejected',
        description: 'An admin rejected this blog. Update it and resubmit.',
      }
    default:
      return {
        tone: 'draft',
        label: 'Draft',
        description: 'Only visible to you and admins. Not published.',
      }
  }
}

export const isPublishedAndApproved = (state?: BlogState) =>
  !!state?.approvedByAdmin && state.status === 'PUBLISHED'

export const getSubmitOutcome = ({
  isDraft,
  canAutoPublish,
  alreadyPublished,
}: {
  isDraft: boolean
  canAutoPublish: boolean
  alreadyPublished: boolean
}): SubmitOutcome => {
  if (isDraft) {
    return {
      action: 'draft',
      label: 'Save draft',
      hint: alreadyPublished
        ? 'Saving as a draft will unpublish this blog.'
        : 'Saved as a draft. Not visible to readers.',
    }
  }
  if (alreadyPublished || canAutoPublish) {
    return {
      action: 'publish',
      label: 'Publish',
      hint: 'Goes live as soon as you save.',
    }
  }
  return {
    action: 'review',
    label: 'Submit for review',
    hint: 'An admin must approve it before it goes live.',
  }
}

export type FormStatusInput = {
  isSaving: boolean
  isUploadingBanner: boolean
  isDirty: boolean
  errorCount: number
  submitError: string | null
  autosave?: FormStatus | null
}

export type FormStatus = {
  tone: 'info' | 'error'
  text: string
  action?: 'retry'
}

export const getFormStatus = ({
  isSaving,
  isUploadingBanner,
  isDirty,
  errorCount,
  submitError,
  autosave = null,
}: FormStatusInput): FormStatus | null => {
  if (isSaving) return { tone: 'info', text: 'Saving...' }
  if (submitError) {
    return { tone: 'error', text: `Could not save: ${submitError}` }
  }
  if (errorCount > 0) {
    const noun = errorCount === 1 ? 'field needs' : 'fields need'
    return { tone: 'error', text: `${errorCount} ${noun} attention.` }
  }
  if (isUploadingBanner) {
    return { tone: 'info', text: 'Uploading banner image...' }
  }
  if (autosave) return autosave
  if (isDirty) return { tone: 'info', text: 'You have unsaved changes.' }
  return null
}

const FALLBACK_ERROR = 'Something went wrong. Please try again.'

export const getErrorMessage = (error: unknown): string | null => {
  if (!error) return null
  if (typeof error === 'string') return error || FALLBACK_ERROR
  if (error instanceof Error) return error.message || FALLBACK_ERROR
  if (typeof error === 'object' && 'message' in error) {
    const { message } = error as { message: unknown }
    if (typeof message === 'string' && message) return message
  }
  return FALLBACK_ERROR
}
