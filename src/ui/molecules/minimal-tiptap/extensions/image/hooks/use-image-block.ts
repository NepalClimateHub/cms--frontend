import type { NodeViewProps } from '@tiptap/react'
import * as React from 'react'
import { isAltValid, normalizeImageAttrs } from '../image-attrs'
import type { UploadStartResult } from '../upload/prepare-upload'
import { useImageActions } from './use-image-actions'
import { useImageResize } from './use-image-resize'
import { useImageUpload } from './use-image-upload'

export const useImageBlock = ({
  editor,
  node,
  updateAttributes,
  deleteNode,
  selected,
}: NodeViewProps) => {
  const attrs = normalizeImageAttrs(node.attrs)
  const [isCropperOpen, setIsCropperOpen] = React.useState(false)
  const [loadFailed, setLoadFailed] = React.useState(false)
  const upload = useImageUpload({
    editor,
    src: attrs.src,
    uploadId: node.attrs.uploadId ?? null,
    updateAttributes,
    deleteNode,
  })
  const displaySrc = upload.previewUrl ?? attrs.src
  const actions = useImageActions({
    editor,
    node,
    src: displaySrc ?? '',
    onCropClick: () => setIsCropperOpen(true),
    onReplaceClick: upload.replace,
  })

  const naturalSize = React.useRef<{ width: number; height: number } | null>(
    null
  )

  React.useEffect(() => {
    setLoadFailed(false)
  }, [displaySrc])

  React.useEffect(() => {
    const natural = naturalSize.current
    if (natural && editor.isEditable && !(attrs.width && attrs.height)) {
      updateAttributes(natural)
    }
  }, [attrs.width, attrs.height, editor, updateAttributes])

  const handleNaturalSize = (width: number, height: number) => {
    naturalSize.current = { width, height }
    if (editor.isEditable && !(attrs.width && attrs.height)) {
      updateAttributes({ width, height })
    }
  }

  const busy = upload.state !== null && upload.state.status !== 'success'
  const resize = useImageResize({
    width: attrs.width,
    height: attrs.height,
    enabled: editor.isEditable && !busy && !loadFailed,
    onCommit: (width, height) => updateAttributes({ width, height }),
  })

  const handleCrop = (blob: Blob): UploadStartResult =>
    upload.begin(new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' }))

  return {
    attrs,
    displaySrc,
    upload,
    actions,
    isCropperOpen,
    setIsCropperOpen,
    loadFailed,
    setLoadFailed,
    altMissing: !isAltValid(attrs.alt),
    busy,
    resize,
    showResizeHandles: selected && editor.isEditable && !busy && !loadFailed,
    handleNaturalSize,
    handleCrop,
  }
}
