import * as React from 'react'
import type { Node } from '@tiptap/pm/model'
import type { Editor } from '@tiptap/react'
import { isUrl } from '../../../utils'

interface UseImageActionsProps {
  editor: Editor
  node: Node
  src: string
  onViewClick: (value: boolean) => void
  onResizeClick: () => void
  onCropClick: () => void
}

export type ImageActionHandlers = {
  onView?: () => void
  onDownload?: () => void
  onCopy?: () => void
  onCopyLink?: () => void
  onRemoveImg?: () => void
}

export const useImageActions = ({
  editor,
  node,
  src,
  onViewClick,
  onResizeClick,
  onCropClick,
}: UseImageActionsProps) => {
  const isLink = React.useMemo(() => isUrl(src), [src])

  const onView = React.useCallback(() => {
    onViewClick(true)
  }, [onViewClick])

  const onDownload = React.useCallback(() => {
    editor.commands.downloadImage({ src: node.attrs.src, alt: node.attrs.alt })
  }, [editor.commands, node.attrs.alt, node.attrs.src])

  const onCopy = React.useCallback(() => {
    editor.commands.copyImage({ src: node.attrs.src })
  }, [editor.commands, node.attrs.src])

  const onCopyLink = React.useCallback(() => {
    editor.commands.copyLink({ src: node.attrs.src })
  }, [editor.commands, node.attrs.src])

  const onResize = React.useCallback(() => {
    onResizeClick()
  }, [onResizeClick])

  const onCrop = React.useCallback(() => {
    onCropClick()
  }, [onCropClick])

  const onRemoveImg = React.useCallback(() => {
    editor.commands.command(({ tr, dispatch }) => {
      const { selection } = tr
      const nodeAtSelection = tr.doc.nodeAt(selection.from)

      if (nodeAtSelection && nodeAtSelection.type.name === 'image') {
        if (dispatch) {
          tr.deleteSelection()
          return true
        }
      }
      return false
    })
  }, [editor.commands])

  return {
    isLink,
    onView,
    onDownload,
    onCopy,
    onCopyLink,
    onResize,
    onCrop,
    onRemoveImg,
  }
}
