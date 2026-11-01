import { describe, expect, it } from 'vitest'
import { prepareImageUpload } from './prepare-upload'
import type { ImageUploader } from './upload-task'

const uploader: ImageUploader = async () => ({
  url: 'https://ik.imagekit.io/nch/a.jpg',
  width: null,
  height: null,
})

const jpeg = (size = 10) =>
  new File([new Uint8Array(size)], 'c.jpg', { type: 'image/jpeg' })

describe('prepareImageUpload', () => {
  it('accepts a valid file when an uploader is configured', () => {
    const result = prepareImageUpload(jpeg(), {
      allowedMimeTypes: ['image/*'],
      maxFileSize: 100,
      uploadImage: uploader,
    })
    expect(result.ok).toBe(true)
  })

  it('reports type errors with a message and the raw errors', () => {
    const result = prepareImageUpload(
      new File(['x'], 'a.txt', { type: 'text/plain' }),
      { allowedMimeTypes: ['image/*'], uploadImage: uploader }
    )
    expect(result).toMatchObject({ ok: false })
    if (!result.ok) {
      expect(result.errors[0].reason).toBe('type')
      expect(result.message).toMatch(/not allowed/)
    }
  })

  it('reports oversize files with the limit in the message', () => {
    const result = prepareImageUpload(jpeg(3 * 1024 * 1024), {
      allowedMimeTypes: ['image/*'],
      maxFileSize: 1024 * 1024,
      uploadImage: uploader,
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.message).toMatch(/1 MB/)
  })

  it('fails visibly when no uploader is configured', () => {
    const result = prepareImageUpload(jpeg(), { allowedMimeTypes: [] })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors).toEqual([])
      expect(result.message).toMatch(/not configured/)
    }
  })
})
