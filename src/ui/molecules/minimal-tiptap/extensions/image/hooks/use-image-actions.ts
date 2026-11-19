import type { Node } from '@tiptap/pm/model'
import type { Editor } from '@tiptap/react'
import * as React from 'react'
import { isUrl } from '../../../utils'

interface UseImageActionsProps {
  editor: Editor
  node: Node
  src: string
  onCropClick: () => void
  onReplaceClick: () => void
}

export type ImageActionHandlers = {
  onDownload?: () => void
  onCopy?: () => void
  onCopyLink?: () => void
  onRemoveImg?: () => void
}

export const useImageActions = ({
  editor,
  node,
  src,
  onCropClick,
  onReplaceClick,
}: UseImageActionsProps) => {
  const isLink = React.useMemo(() => isUrl(src), [src])

  const onDownload = React.useCallback(() => {
    editor.commands.downloadImage({ src: node.attrs.src, alt: node.attrs.alt })
  }, [editor.commands, node.attrs.alt, node.attrs.src])

  const onCopy = React.useCallback(() => {
    editor.commands.copyImage({ src: node.attrs.src })
  }, [editor.commands, node.attrs.src])

  const onCopyLink = React.useCallback(() => {
    editor.commands.copyLink({ src: node.attrs.src })
  }, [editor.commands, node.attrs.src])

  const onCrop = React.useCallback(() => {
    onCropClick()
  }, [onCropClick])

  const onReplace = React.useCallback(() => {
    onReplaceClick()
  }, [onReplaceClick])

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
    onDownload,
    onCopy,
    onCopyLink,
    onCrop,
    onReplace,
    onRemoveImg,
  }
}
