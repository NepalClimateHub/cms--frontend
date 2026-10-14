import { describe, expect, it } from 'vitest'
import { checkVersion } from './autosave-conflict'
import { makeValues } from './autosave-fixtures'
import {
  buildAutosaveBody,
  getAutosaveTarget,
  isServerSendable,
} from './autosave-policy'

describe('getAutosaveTarget', () => {
  it('uses the server only for existing DRAFT blogs', () => {
    expect(getAutosaveTarget({ blogId: 'b1', status: 'DRAFT' })).toBe('server')
  })

  it.each(['PUBLISHED', 'UNDER_REVIEW', 'REJECTED'] as const)(
    'keeps %s blogs local-only',
    (status) => {
      expect(getAutosaveTarget({ blogId: 'b1', status })).toBe('local')
    }
  )

  it('keeps unknown status and unsaved new blogs local-only', () => {
    expect(getAutosaveTarget({ blogId: 'b1' })).toBe('local')
    expect(getAutosaveTarget({ blogId: null, status: 'DRAFT' })).toBe('local')
  })
})

describe('buildAutosaveBody', () => {
  it('always sends the draft flag, even when the form says publish', () => {
    const body = buildAutosaveBody(makeValues({ isDraft: false }))
    expect(body.isDraft).toBe(true)
  })

  it('never carries publish or review fields', () => {
    const body = buildAutosaveBody(makeValues({ isDraft: false }))
    for (const key of ['status', 'action', 'approvedByAdmin', 'remarks']) {
      expect(body).not.toHaveProperty(key)
    }
  })

  it('keeps content and banner fields', () => {
    const body = buildAutosaveBody(makeValues())
    expect(body).toMatchObject({
      content: '<p>Body</p>',
      bannerImageId: 'img-1',
      bannerImageUrl: 'https://cdn.example/img.png',
    })
  })
})

describe('isServerSendable', () => {
  it('rejects values that fail the form schema', () => {
    expect(isServerSendable(makeValues())).toBe(true)
    expect(isServerSendable(makeValues({ title: '' }))).toBe(false)
    expect(
      isServerSendable(makeValues({ publishedDate: new Date('nope') }))
    ).toBe(false)
  })
})

describe('checkVersion', () => {
  const base = '2026-01-01T10:00:00.000Z'

  it('is ok when the server copy is unchanged or older', () => {
    expect(checkVersion(base, base)).toBe('ok')
    expect(checkVersion(base, '2026-01-01T09:00:00.000Z')).toBe('ok')
  })

  it('flags a newer server copy', () => {
    expect(checkVersion(base, '2026-01-01T10:00:00.001Z')).toBe('conflict')
  })

  it('cannot verify missing or invalid versions', () => {
    expect(checkVersion(null, base)).toBe('unknown')
    expect(checkVersion(base, 'garbage')).toBe('unknown')
  })
})
