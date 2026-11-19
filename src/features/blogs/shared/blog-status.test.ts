import { describe, expect, it } from 'vitest'
import {
  getBlogStateView,
  getErrorMessage,
  getFormStatus,
  getSubmitOutcome,
} from './blog-status'

describe('getBlogStateView', () => {
  it('maps each persisted status to a distinct tone', () => {
    expect(getBlogStateView({ status: 'DRAFT' }).tone).toBe('draft')
    expect(getBlogStateView({ status: 'UNDER_REVIEW' }).tone).toBe('review')
    expect(getBlogStateView({ status: 'PUBLISHED' }).tone).toBe('published')
    expect(getBlogStateView({ status: 'REJECTED' }).tone).toBe('rejected')
  })

  it('falls back to isDraft when status is missing', () => {
    expect(getBlogStateView({ isDraft: true }).tone).toBe('draft')
    expect(getBlogStateView({ isDraft: false }).tone).toBe('review')
  })
})

describe('getSubmitOutcome', () => {
  const base = { canAutoPublish: false, alreadyPublished: false }

  it('draft saves as draft', () => {
    expect(getSubmitOutcome({ ...base, isDraft: true }).label).toBe(
      'Save draft'
    )
  })

  it('warns that saving a published blog as draft unpublishes it', () => {
    const outcome = getSubmitOutcome({
      ...base,
      isDraft: true,
      alreadyPublished: true,
    })
    expect(outcome.hint).toContain('unpublish')
  })

  it('writers submit for review, admins publish', () => {
    expect(getSubmitOutcome({ ...base, isDraft: false }).label).toBe(
      'Submit for review'
    )
    expect(
      getSubmitOutcome({ ...base, isDraft: false, canAutoPublish: true }).label
    ).toBe('Publish')
  })

  it('exposes the save action for gating', () => {
    expect(getSubmitOutcome({ ...base, isDraft: true }).action).toBe('draft')
    expect(getSubmitOutcome({ ...base, isDraft: false }).action).toBe('review')
    expect(
      getSubmitOutcome({ ...base, isDraft: false, canAutoPublish: true }).action
    ).toBe('publish')
  })

  it('already published blogs stay live for writers', () => {
    expect(
      getSubmitOutcome({ ...base, isDraft: false, alreadyPublished: true })
        .label
    ).toBe('Publish')
  })
})

describe('getFormStatus', () => {
  const idle = {
    isSaving: false,
    isUploadingBanner: false,
    isDirty: false,
    errorCount: 0,
    submitError: null,
  }

  it('is empty when pristine', () => {
    expect(getFormStatus(idle)).toBeNull()
  })

  it('prioritises saving, then submit error, then validation', () => {
    expect(
      getFormStatus({ ...idle, isSaving: true, submitError: 'x' })?.text
    ).toBe('Saving...')
    expect(getFormStatus({ ...idle, submitError: 'Boom' })?.tone).toBe('error')
    expect(getFormStatus({ ...idle, errorCount: 2 })?.text).toContain(
      '2 fields'
    )
  })

  it('reports unsaved changes', () => {
    expect(getFormStatus({ ...idle, isDirty: true })?.text).toContain('unsaved')
  })

  it('shows autosave state over the generic dirty hint but not over manual saves', () => {
    const autosave = { tone: 'info' as const, text: 'Saved 09:05' }
    expect(getFormStatus({ ...idle, isDirty: true, autosave })?.text).toBe(
      'Saved 09:05'
    )
    expect(getFormStatus({ ...idle, isSaving: true, autosave })?.text).toBe(
      'Saving...'
    )
  })
})

describe('getErrorMessage', () => {
  it('extracts messages from errors, objects and strings', () => {
    expect(getErrorMessage(new Error('a'))).toBe('a')
    expect(getErrorMessage({ message: 'b' })).toBe('b')
    expect(getErrorMessage('c')).toBe('c')
    expect(getErrorMessage(null)).toBeNull()
    expect(getErrorMessage({})).toContain('Something went wrong')
  })
})
