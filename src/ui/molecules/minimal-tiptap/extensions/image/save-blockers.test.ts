import type { Editor } from '@tiptap/react'
import { afterEach, describe, expect, it } from 'vitest'
import { getImageSaveBlockers } from './save-blockers'
import { releaseUpload, startImageUpload } from './upload/upload-registry'
import type { ImageUploader } from './upload/upload-task'

interface FakeNode {
  type: { name: string }
  attrs: Record<string, unknown>
}

const image = (attrs: Record<string, unknown>): FakeNode => ({
  type: { name: 'image' },
  attrs: {
    src: 'https://ik.imagekit.io/nch/a.jpg',
    alt: 'A river',
    uploadId: null,
    ...attrs,
  },
})

const fakeEditor = (nodes: FakeNode[]): Editor =>
  ({
    state: {
      tr: { setNodeMarkup: () => undefined, setMeta: () => undefined },
      doc: {
        descendants: (cb: (n: FakeNode) => boolean | undefined) => {
          nodes.forEach((n) => {
            cb(n)
          })
        },
      },
    },
    view: { dispatch: () => undefined },
  }) as unknown as Editor

const file = () => new File(['x'], 'p.png', { type: 'image/png' })
const settle = () => new Promise((resolve) => setTimeout(resolve, 0))
const started: string[] = []

const begin = (uploader: ImageUploader): string => {
  const { uploadId } = startImageUpload(fakeEditor([]), file(), uploader)
  started.push(uploadId)
  return uploadId
}

afterEach(() => {
  started.splice(0).forEach(releaseUpload)
})

describe('getImageSaveBlockers', () => {
  it('reports nothing for settled images with alt', () => {
    const editor = fakeEditor([image({}), image({ alt: 'Second' })])
    expect(getImageSaveBlockers(editor)).toEqual({
      missingAlt: 0,
      unsettledUploads: 0,
    })
  })

  it('counts images with missing or blank alt', () => {
    const editor = fakeEditor([image({ alt: null }), image({ alt: '   ' })])
    expect(getImageSaveBlockers(editor).missingAlt).toBe(2)
  })

  it('counts pending uploads', () => {
    const uploadId = begin(() => new Promise(() => undefined))
    const editor = fakeEditor([image({ src: null, uploadId })])
    expect(getImageSaveBlockers(editor).unsettledUploads).toBe(1)
  })

  it('counts failed uploads', async () => {
    const uploadId = begin(async () => {
      throw new Error('boom')
    })
    await settle()
    const editor = fakeEditor([image({ uploadId })])
    expect(getImageSaveBlockers(editor).unsettledUploads).toBe(1)
  })

  it('counts interrupted uploads that have no registry entry', () => {
    const editor = fakeEditor([image({ src: null, uploadId: 'gone' })])
    expect(getImageSaveBlockers(editor).unsettledUploads).toBe(1)
  })

  it('counts non-persistable sources and ignores other node types', () => {
    const editor = fakeEditor([
      image({ src: 'blob:http://localhost/x' }),
      { type: { name: 'paragraph' }, attrs: { uploadId: 'x' } },
    ])
    expect(getImageSaveBlockers(editor).unsettledUploads).toBe(1)
  })
})
