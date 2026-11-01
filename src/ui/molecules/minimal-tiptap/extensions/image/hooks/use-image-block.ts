import type { NodeViewProps } from '@tiptap/react'
import * as React from 'react'
import { isAltValid, normalizeImageAttrs } from '../image-attrs'
import type { UploadStartResult } from '../upload/prepare-upload'
import { useImageActions } from './use-image-actions'
import { useImageUpload } from './use-image-upload'

export const useImageBlock = ({
  editor,
  node,
  updateAttributes,
  deleteNode,
}: NodeViewProps) => {
  const attrs = normalizeImageAttrs(node.attrs)
  const [isZoomed, setIsZoomed] = React.useState(false)
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
    onViewClick: setIsZoomed,
    onCropClick: () => setIsCropperOpen(true),
    onReplaceClick: upload.replace,
  })

  React.useEffect(() => {
    setLoadFailed(false)
  }, [displaySrc])

  const handleNaturalSize = (width: number, height: number) => {
    if (editor.isEditable && (!attrs.width || !attrs.height)) {
      updateAttributes({ width, height })
    }
  }

  const handleCrop = (blob: Blob): UploadStartResult =>
    upload.begin(new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' }))

  return {
    attrs,
    displaySrc,
    upload,
    actions,
    isZoomed,
    setIsZoomed,
    isCropperOpen,
    setIsCropperOpen,
    loadFailed,
    setLoadFailed,
    altMissing: !isAltValid(attrs.alt),
    busy: upload.state !== null && upload.state.status !== 'success',
    handleNaturalSize,
    handleCrop,
  }
}
