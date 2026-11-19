import { describe, expect, it } from 'vitest'
import {
  CROP_FAILED,
  CROP_LOAD_ERROR,
  describeCropError,
} from './crop-messages'

describe('describeCropError', () => {
  it('maps canvas failures to user-facing text', () => {
    expect(describeCropError(new Error('Canvas is empty'))).toMatch(/empty/)
    expect(describeCropError(new Error('No 2d context'))).toMatch(/browser/)
  })

  it('treats tainted canvas as a load problem', () => {
    const error = new Error('tainted')
    error.name = 'SecurityError'
    expect(describeCropError(error)).toBe(CROP_LOAD_ERROR)
  })

  it('never returns an empty message for unknown rejections', () => {
    expect(describeCropError(new Event('error'))).toBe(CROP_FAILED)
    expect(describeCropError(undefined)).toBe(CROP_FAILED)
  })
})
