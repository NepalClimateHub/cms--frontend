import type { Editor } from '@tiptap/react'
import { describe, expect, it } from 'vitest'
import {
  getPendingUpload,
  releaseUpload,
  startImageUpload,
} from './upload-registry'
import type { ImageUploader } from './upload-task'

interface Dispatched {
  attrs: Record<string, unknown>
}

const fakeEditor = (uploadIdOf: () => string | null) => {
  const dispatched: Dispatched[] = []
  const tr = {
    setNodeMarkup(
      _pos: number,
      _type: undefined,
      attrs: Record<string, unknown>
    ) {
      dispatched.push({ attrs })
      return tr
    },
    setMeta: () => tr,
  }
  const node = {
    type: { name: 'image' },
    get attrs() {
      return { uploadId: uploadIdOf(), src: null }
    },
  }
  const editor = {
    state: {
      tr,
      doc: {
        descendants: (
          cb: (n: typeof node, pos: number) => boolean | undefined
        ) => {
          cb(node, 0)
        },
      },
    },
    view: { dispatch: () => undefined },
  } as unknown as Editor
  return { editor, dispatched }
}

const file = () => new File(['x'], 'p.png', { type: 'image/png' })
const settle = () => new Promise((resolve) => setTimeout(resolve, 0))

describe('startImageUpload', () => {
  it('replaces the node src with the ImageKit URL and clears uploadId', async () => {
    let id: string | null = null
    const { editor, dispatched } = fakeEditor(() => id)
    const uploader: ImageUploader = async () => ({
      url: 'https://ik.imagekit.io/nch/p.png',
      width: 800,
      height: 600,
    })
    const started = startImageUpload(editor, file(), uploader)
    id = started.uploadId
    await settle()

    expect(dispatched).toHaveLength(1)
    expect(dispatched[0].attrs.src).toBe('https://ik.imagekit.io/nch/p.png')
    expect(dispatched[0].attrs.uploadId).toBeNull()
    expect(dispatched[0].attrs.width).toBe(800)
    expect(getPendingUpload(started.uploadId)).toBeUndefined()
  })

  it('never writes a blob: or data: URL into the node', async () => {
    let id: string | null = null
    const { editor, dispatched } = fakeEditor(() => id)
    const uploader: ImageUploader = async () => ({
      url: 'blob:http://localhost/xyz',
      width: null,
      height: null,
    })
    const started = startImageUpload(editor, file(), uploader)
    id = started.uploadId
    await settle()

    expect(dispatched).toHaveLength(0)
    expect(getPendingUpload(started.uploadId)?.task.getState().status).toBe(
      'error'
    )
    releaseUpload(started.uploadId)
    expect(getPendingUpload(started.uploadId)).toBeUndefined()
  })

  it('keeps failed uploads retryable until released', async () => {
    let id: string | null = null
    let attempts = 0
    const { editor, dispatched } = fakeEditor(() => id)
    const uploader: ImageUploader = async () => {
      attempts += 1
      if (attempts === 1) throw new Error('boom')
      return {
        url: 'https://ik.imagekit.io/nch/r.png',
        width: null,
        height: null,
      }
    }
    const started = startImageUpload(editor, file(), uploader)
    id = started.uploadId
    await settle()
    const entry = getPendingUpload(started.uploadId)
    expect(entry?.task.getState().status).toBe('error')

    await entry?.task.retry()
    expect(attempts).toBe(2)
    expect(dispatched).toHaveLength(1)
    expect(dispatched[0].attrs.src).toBe('https://ik.imagekit.io/nch/r.png')
  })
})
