import type { Editor } from '@tiptap/react'
import * as React from 'react'
import { isPersistableSrc } from '../image-attrs'
import { pickImageFile } from '../upload/pick-image-file'
import {
  prepareImageUpload,
  type UploadStartResult,
} from '../upload/prepare-upload'
import {
  getImageOptions,
  getPendingUpload,
  releaseUpload,
  startImageUpload,
} from '../upload/upload-registry'
import type { UploadState } from '../upload/upload-task'

interface UseImageUploadProps {
  editor: Editor
  src: string | null
  uploadId: string | null
  updateAttributes: (attrs: Record<string, unknown>) => void
  deleteNode: () => void
}

const INTERRUPTED: UploadState = {
  status: 'error',
  progress: 0,
  message: 'Upload was interrupted',
}

const IMAGE_ACCEPT = 'image/*'

export const useImageUpload = ({
  editor,
  src,
  uploadId,
  updateAttributes,
  deleteNode,
}: UseImageUploadProps) => {
  const pending = uploadId ? getPendingUpload(uploadId) : undefined
  const [state, setState] = React.useState<UploadState | null>(null)
  const adoptedRef = React.useRef<string | null>(null)

  React.useEffect(() => {
    if (!uploadId) {
      setState(null)
      return
    }
    if (!pending) {
      setState(INTERRUPTED)
      return
    }
    setState(pending.task.getState())
    return pending.task.subscribe(setState)
  }, [uploadId, pending])

  const begin = React.useCallback(
    (file: File): UploadStartResult => {
      const options = getImageOptions(editor)
      const prepared = prepareImageUpload(file, options)
      if (!prepared.ok) {
        if (prepared.errors.length > 0) {
          options.onValidationError?.(prepared.errors)
        }
        return { ok: false, message: prepared.message }
      }
      const started = startImageUpload(editor, file, prepared.uploader)
      updateAttributes({ uploadId: started.uploadId, fileName: file.name })
      return { ok: true }
    },
    [editor, updateAttributes]
  )

  React.useEffect(() => {
    if (uploadId || !src || isPersistableSrc(src) || adoptedRef.current === src)
      return
    adoptedRef.current = src
    fetch(src)
      .then((response) => response.blob())
      .then((blob) => {
        const result = begin(new File([blob], 'image', { type: blob.type }))
        if (!result.ok) setState(INTERRUPTED)
      })
      .catch(() => setState(INTERRUPTED))
  }, [src, uploadId, begin])

  const retry = React.useCallback(() => {
    void pending?.task.retry()
  }, [pending])

  const cancel = React.useCallback(() => {
    if (uploadId) releaseUpload(uploadId)
    if (isPersistableSrc(src)) updateAttributes({ uploadId: null })
    else deleteNode()
  }, [uploadId, src, updateAttributes, deleteNode])

  const replace = React.useCallback(
    () =>
      pickImageFile(IMAGE_ACCEPT, (file) => {
        begin(file)
      }),
    [begin]
  )

  return {
    state,
    previewUrl: pending?.previewUrl ?? null,
    canRetry: pending !== undefined,
    begin,
    retry,
    cancel,
    replace,
  }
}
