import { describe, expect, it } from 'vitest'
import { shouldBlockNavigation } from './unsaved-changes'

describe('shouldBlockNavigation', () => {
  const clean = { isDirty: false, isSaving: false, isSaved: false }

  it('does not block a pristine form', () => {
    expect(shouldBlockNavigation(clean)).toBe(false)
  })

  it('blocks a dirty form', () => {
    expect(shouldBlockNavigation({ ...clean, isDirty: true })).toBe(true)
  })

  it('does not block while saving or after a successful save', () => {
    expect(
      shouldBlockNavigation({ ...clean, isDirty: true, isSaving: true })
    ).toBe(false)
    expect(
      shouldBlockNavigation({ ...clean, isDirty: true, isSaved: true })
    ).toBe(false)
  })
})
