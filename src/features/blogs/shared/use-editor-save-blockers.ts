import type { Editor } from '@tiptap/react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { getImageSaveBlockers } from '@/ui/molecules/minimal-tiptap'
import { NO_BLOCKERS, type SaveBlockers } from './save-gate'

const isSame = (a: SaveBlockers, b: SaveBlockers) =>
  a.missingAlt === b.missingAlt && a.unsettledUploads === b.unsettledUploads

export const useEditorSaveBlockers = () => {
  const editorRef = useRef<Editor | null>(null)
  const [blockers, setBlockers] = useState<SaveBlockers>(NO_BLOCKERS)

  const readBlockers = useCallback((): SaveBlockers => {
    const editor = editorRef.current
    if (!editor || editor.isDestroyed) return NO_BLOCKERS
    return getImageSaveBlockers(editor)
  }, [])

  const editorProps = useMemo(
    () => ({
      onTransaction: ({ editor }: { editor: Editor }) => {
        editorRef.current = editor
        const next = getImageSaveBlockers(editor)
        setBlockers((prev) => (isSame(prev, next) ? prev : next))
      },
    }),
    []
  )

  return { blockers, readBlockers, editorProps }
}

export type EditorSaveBlockerProps = ReturnType<
  typeof useEditorSaveBlockers
>['editorProps']
