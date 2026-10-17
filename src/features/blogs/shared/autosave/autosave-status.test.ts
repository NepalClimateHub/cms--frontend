import { describe, expect, it } from 'vitest'
import {
  type AutosaveStatus,
  INITIAL_AUTOSAVE_STATUS,
} from './autosave-scheduler'
import { getAutosaveStatusView } from './autosave-status'

const at = (patch: Partial<AutosaveStatus>): AutosaveStatus => ({
  ...INITIAL_AUTOSAVE_STATUS,
  ...patch,
})

describe('getAutosaveStatusView', () => {
  it('shows nothing while idle or pending', () => {
    expect(getAutosaveStatusView(at({ phase: 'idle' }))).toBeNull()
    expect(getAutosaveStatusView(at({ phase: 'pending' }))).toBeNull()
  })

  it('shows saving and the saved clock time', () => {
    expect(getAutosaveStatusView(at({ phase: 'saving' }))?.text).toBe('Saving…')
    const savedAt = new Date(2026, 0, 2, 9, 5).getTime()
    expect(
      getAutosaveStatusView(at({ phase: 'saved', scope: 'server', savedAt }))
        ?.text
    ).toBe('Saved 09:05')
  })

  it('labels local-only saves so they are not mistaken for live edits', () => {
    const savedAt = new Date(2026, 0, 2, 14, 30).getTime()
    expect(
      getAutosaveStatusView(at({ phase: 'saved', scope: 'local', savedAt }))
        ?.text
    ).toBe('Saved locally 14:30')
  })

  it('offers retry on failure and flags conflicts as errors', () => {
    expect(getAutosaveStatusView(at({ phase: 'failed' }))).toEqual({
      tone: 'error',
      text: 'Autosave failed — retry',
      action: 'retry',
    })
    const conflict = getAutosaveStatusView(at({ phase: 'conflict' }))
    expect(conflict?.tone).toBe('error')
    expect(conflict?.text).toContain('Conflict')
  })
})
