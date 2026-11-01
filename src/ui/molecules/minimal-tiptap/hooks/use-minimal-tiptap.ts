import { Placeholder } from '@tiptap/extension-placeholder'
import { TextAlign } from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import { Typography } from '@tiptap/extension-typography'
import { Underline } from '@tiptap/extension-underline'
import type { Content, Editor, UseEditorOptions } from '@tiptap/react'
import { useEditor } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import * as React from 'react'
import { toast } from 'sonner'
import { cn } from '@/ui/shadcn/lib/utils'
import {
  CodeBlockLowlight,
  Color,
  FileHandler,
  HorizontalRule,
  Image,
  Link,
  ResetMarksOnEnter,
  Selection,
  UnsetAllMarks,
} from '../extensions'
import { imageKitUploader } from '../extensions/image/upload/imagekit-uploader'
import { getOutput } from '../utils'
import { useThrottle } from './use-throttle'

export interface UseMinimalTiptapEditorProps extends UseEditorOptions {
  value?: Content
  output?: 'html' | 'json' | 'text'
  placeholder?: string
  editorClassName?: string
  throttleDelay?: number
  onUpdate?: (content: Content) => void
  onBlur?: (content: Content) => void
}

const createExtensions = (placeholder: string) => [
  StarterKit.configure({
    horizontalRule: false,
    codeBlock: false,
    paragraph: { HTMLAttributes: { class: 'text-node' } },
    heading: { HTMLAttributes: { class: 'heading-node' } },
    blockquote: { HTMLAttributes: { class: 'block-node' } },
    bulletList: { HTMLAttributes: { class: 'list-node' } },
    orderedList: { HTMLAttributes: { class: 'list-node' } },
    code: { HTMLAttributes: { class: 'inline', spellcheck: 'false' } },
    dropcursor: { width: 2, class: 'ProseMirror-dropcursor border' },
  }),
  TextAlign.configure({
    types: ['heading', 'paragraph'],
    alignments: ['left', 'center', 'right', 'justify'],
    defaultAlignment: 'left',
  }),
  Link,
  Underline,
  Image.configure({
    allowedMimeTypes: ['image/*'],
    maxFileSize: 5 * 1024 * 1024,
    uploadImage: imageKitUploader,
    onToggle(editor, files, pos) {
      editor.commands.setImages(
        files.map((file) => ({ src: file })),
        pos
      )
    },
    onImageRemoved() {},
    onValidationError(errors) {
      errors.forEach((error) => {
        toast.error('Image validation error', {
          position: 'bottom-right',
          description: error.reason,
        })
      })
    },
    onActionSuccess({ action }) {
      const mapping = {
        copyImage: 'Copy Image',
        copyLink: 'Copy Link',
        download: 'Download',
      }
      toast.success(mapping[action], {
        position: 'bottom-right',
        description: 'Image action success',
      })
    },
    onActionError(error, { action }) {
      const mapping = {
        copyImage: 'Copy Image',
        copyLink: 'Copy Link',
        download: 'Download',
      }
      toast.error(`Failed to ${mapping[action]}`, {
        position: 'bottom-right',
        description: error.message,
      })
    },
  }),
  FileHandler.configure({
    allowBase64: false,
    allowedMimeTypes: ['image/*'],
    maxFileSize: 5 * 1024 * 1024,
    onDrop: (editor, files, pos) => {
      editor.commands.setImages(
        files.map((file) => ({ src: file })),
        pos
      )
    },
    onPaste: (editor, files) => {
      editor.commands.setImages(files.map((file) => ({ src: file })))
    },
    onValidationError: (errors) => {
      errors.forEach((error) => {
        toast.error('Image validation error', {
          position: 'bottom-right',
          description: error.reason,
        })
      })
    },
  }),
  Color,
  TextStyle,
  Selection,
  Typography,
  UnsetAllMarks,
  HorizontalRule,
  ResetMarksOnEnter,
  CodeBlockLowlight,
  Placeholder.configure({ placeholder: () => placeholder }),
]

export const useMinimalTiptapEditor = ({
  value,
  output = 'html',
  placeholder = '',
  editorClassName,
  throttleDelay = 0,
  onUpdate,
  onBlur,
  ...props
}: UseMinimalTiptapEditorProps) => {
  const throttledSetValue = useThrottle((...args: unknown[]) => {
    onUpdate?.(args[0] as Content)
  }, throttleDelay)

  const handleUpdate = React.useCallback(
    (editor: Editor) => throttledSetValue(getOutput(editor, output)),
    [output, throttledSetValue]
  )

  const handleCreate = React.useCallback(
    (editor: Editor) => {
      if (value && editor.isEmpty) {
        editor.commands.setContent(value)
      }
    },
    [value]
  )

  const handleBlur = React.useCallback(
    (editor: Editor) => onBlur?.(getOutput(editor, output)),
    [output, onBlur]
  )

  const editor = useEditor({
    extensions: createExtensions(placeholder),
    editorProps: {
      attributes: {
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
        class: cn('focus:outline-none', editorClassName),
      },
    },
    onUpdate: ({ editor }) => handleUpdate(editor),
    onCreate: ({ editor }) => handleCreate(editor),
    onBlur: ({ editor }) => handleBlur(editor),
    ...props,
  })

  React.useEffect(() => {
    if (editor && value !== undefined && !editor.isDestroyed) {
      const currentContent = getOutput(editor, output)
      if (currentContent !== value) {
        editor.commands.setContent(value)
      }
    }
  }, [editor, value, output])

  return editor
}

export default useMinimalTiptapEditor
