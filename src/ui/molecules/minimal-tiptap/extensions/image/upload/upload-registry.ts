import type { Editor } from '@tiptap/react'
import { type FileError, randomId } from '../../../utils'
import {
  createUploadTask,
  type ImageUploader,
  type UploadTask,
} from './upload-task'

export interface ImageUploadOptions {
  uploadImage?: ImageUploader
  allowedMimeTypes: string[]
  maxFileSize?: number
  onValidationError?: (errors: FileError[]) => void
}

interface PendingUpload {
  task: UploadTask
  previewUrl: string
}

const pending = new Map<string, PendingUpload>()

export const getPendingUpload = (uploadId: string): PendingUpload | undefined =>
  pending.get(uploadId)

export const releaseUpload = (uploadId: string): void => {
  const entry = pending.get(uploadId)
  if (!entry) return
  URL.revokeObjectURL(entry.previewUrl)
  pending.delete(uploadId)
}

export const getImageOptions = (editor: Editor): ImageUploadOptions => {
  const options: ImageUploadOptions | undefined =
    editor.extensionManager.extensions.find(
      (ext) => ext.name === 'image'
    )?.options
  return options ?? { allowedMimeTypes: [] }
}

const applyUploadResult = (
  editor: Editor,
  uploadId: string,
  attrs: Record<string, unknown>
): void => {
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name !== 'image' || node.attrs.uploadId !== uploadId) {
      return true
    }
    const tr = editor.state.tr
      .setNodeMarkup(pos, undefined, { ...node.attrs, ...attrs })
      .setMeta('addToHistory', false)
    editor.view.dispatch(tr)
    return false
  })
}

export const startImageUpload = (
  editor: Editor,
  file: File,
  uploader: ImageUploader
): { uploadId: string; previewUrl: string } => {
  const uploadId = randomId()
  const previewUrl = URL.createObjectURL(file)
  const task = createUploadTask(file, uploader)
  pending.set(uploadId, { task, previewUrl })

  task.subscribe((state) => {
    if (state.status !== 'success') return
    applyUploadResult(editor, uploadId, {
      src: state.asset.url,
      width: state.asset.width,
      height: state.asset.height,
      uploadId: null,
    })
    releaseUpload(uploadId)
  })
  void task.start()

  return { uploadId, previewUrl }
}
