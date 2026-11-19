import type { Editor } from '@tiptap/react'
import { countImagesMissingAlt, isPersistableSrc } from './image-attrs'
import { getPendingUpload } from './upload/upload-registry'

export interface ImageSaveBlockers {
  missingAlt: number
  unsettledUploads: number
}

const isUnsettled = (attrs: Record<string, unknown>): boolean => {
  const { uploadId, src } = attrs
  if (typeof uploadId === 'string' && uploadId !== '') {
    const entry = getPendingUpload(uploadId)
    return entry?.task.getState().status !== 'success'
  }
  return typeof src === 'string' && src !== '' && !isPersistableSrc(src)
}

const countUnsettledUploads = (editor: Editor): number => {
  let count = 0
  editor.state.doc.descendants((node) => {
    if (node.type.name === 'image' && isUnsettled(node.attrs)) count += 1
    return true
  })
  return count
}

export const getImageSaveBlockers = (editor: Editor): ImageSaveBlockers => ({
  missingAlt: countImagesMissingAlt(editor.state.doc),
  unsettledUploads: countUnsettledUploads(editor),
})
