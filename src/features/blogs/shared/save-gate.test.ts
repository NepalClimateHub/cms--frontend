import { describe, expect, it } from 'vitest'
import {
  getSaveGate,
  isServerSaveBlocked,
  NO_BLOCKERS,
  type SaveAction,
} from './save-gate'

const actions: SaveAction[] = ['draft', 'review', 'publish']

describe('getSaveGate', () => {
  it.each(actions)('allows %s when nothing blocks', (action) => {
    expect(getSaveGate({ blockers: NO_BLOCKERS, action })).toEqual({
      allowed: true,
      message: null,
    })
  })

  it.each(actions)('blocks %s while uploads are unsettled', (action) => {
    const gate = getSaveGate({
      blockers: { missingAlt: 0, unsettledUploads: 2 },
      action,
    })
    expect(gate.allowed).toBe(false)
    expect(gate.message).toBe(
      '2 images still uploading or failed — retry or remove before saving'
    )
  })

  it('uses the singular noun for one image', () => {
    const gate = getSaveGate({
      blockers: { missingAlt: 0, unsettledUploads: 1 },
      action: 'draft',
    })
    expect(gate.message).toBe(
      '1 image still uploading or failed — retry or remove before saving'
    )
  })

  it('allows draft with a warning when alt text is missing', () => {
    expect(
      getSaveGate({
        blockers: { missingAlt: 3, unsettledUploads: 0 },
        action: 'draft',
      })
    ).toEqual({ allowed: true, message: '3 images missing alt text' })
  })

  it.each(['review', 'publish'] as const)(
    'blocks %s when alt text is missing',
    (action) => {
      expect(
        getSaveGate({
          blockers: { missingAlt: 1, unsettledUploads: 0 },
          action,
        })
      ).toEqual({ allowed: false, message: '1 image missing alt text' })
    }
  )

  it.each(actions)(
    'prefers the upload message over alt text for %s',
    (action) => {
      const gate = getSaveGate({
        blockers: { missingAlt: 4, unsettledUploads: 1 },
        action,
      })
      expect(gate.allowed).toBe(false)
      expect(gate.message).toContain('still uploading or failed')
    }
  )
})

describe('isServerSaveBlocked', () => {
  it('blocks server autosave only for unsettled uploads', () => {
    expect(isServerSaveBlocked(NO_BLOCKERS)).toBe(false)
    expect(isServerSaveBlocked({ missingAlt: 5, unsettledUploads: 0 })).toBe(
      false
    )
    expect(isServerSaveBlocked({ missingAlt: 0, unsettledUploads: 1 })).toBe(
      true
    )
  })
})
