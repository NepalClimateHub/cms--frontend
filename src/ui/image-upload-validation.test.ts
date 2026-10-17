import { describe, expect, it } from 'vitest'
import { MAX_IMAGE_BYTES, validateImageFile } from './image-upload-validation'

describe('validateImageFile', () => {
  it('accepts a file of exactly the limit', () => {
    expect(
      validateImageFile({ type: 'image/png', size: MAX_IMAGE_BYTES })
    ).toEqual({ ok: true })
  })

  it('rejects a file one byte over the limit with exact byte counts', () => {
    const result = validateImageFile({
      type: 'image/png',
      size: MAX_IMAGE_BYTES + 1,
    })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.message).toContain('5,000,001 bytes')
      expect(result.message).toContain('5,000,000 bytes')
    }
  })

  it('does not round sizes to MB before comparing', () => {
    expect(validateImageFile({ type: 'image/webp', size: 5_999_999 }).ok).toBe(
      false
    )
  })

  it('rejects unsupported types and names the type', () => {
    const result = validateImageFile({ type: 'image/gif', size: 100 })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.message).toContain('image/gif')
  })

  it('rejects empty files', () => {
    expect(validateImageFile({ type: 'image/jpeg', size: 0 }).ok).toBe(false)
  })
})
