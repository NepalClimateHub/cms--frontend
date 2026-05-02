import * as React from 'react'
import {
  TextAlignLeftIcon,
  TextAlignCenterIcon,
  TextAlignRightIcon,
  TextAlignJustifyIcon,
} from '@radix-ui/react-icons'
import type { toggleVariants } from '@/ui/shadcn/toggle'
import type { Editor } from '@tiptap/react'
import type { VariantProps } from 'class-variance-authority'
import type { FormatAction } from '../../types'
import { ToolbarSection } from '../toolbar-section'

type TextAlignAction = 'left' | 'center' | 'right' | 'justify'

interface TextAlign extends FormatAction {
  value: TextAlignAction
}

const formatActions: TextAlign[] = [
  {
    value: 'left',
    label: 'Align left',
    icon: <TextAlignLeftIcon className='size-5' />,
    isActive: (editor) => editor.isActive({ textAlign: 'left' }),
    action: (editor) => editor.chain().focus().setTextAlign('left').run(),
    canExecute: (editor) =>
      editor.can().chain().focus().setTextAlign('left').run(),
    shortcuts: ['mod', 'shift', 'L'],
  },
  {
    value: 'center',
    label: 'Align center',
    icon: <TextAlignCenterIcon className='size-5' />,
    isActive: (editor) => editor.isActive({ textAlign: 'center' }),
    action: (editor) => editor.chain().focus().setTextAlign('center').run(),
    canExecute: (editor) =>
      editor.can().chain().focus().setTextAlign('center').run(),
    shortcuts: ['mod', 'shift', 'E'],
  },
  {
    value: 'right',
    label: 'Align right',
    icon: <TextAlignRightIcon className='size-5' />,
    isActive: (editor) => editor.isActive({ textAlign: 'right' }),
    action: (editor) => editor.chain().focus().setTextAlign('right').run(),
    canExecute: (editor) =>
      editor.can().chain().focus().setTextAlign('right').run(),
    shortcuts: ['mod', 'shift', 'R'],
  },
  {
    value: 'justify',
    label: 'Justify',
    icon: <TextAlignJustifyIcon className='size-5' />,
    isActive: (editor) => editor.isActive({ textAlign: 'justify' }),
    action: (editor) => editor.chain().focus().setTextAlign('justify').run(),
    canExecute: (editor) =>
      editor.can().chain().focus().setTextAlign('justify').run(),
    shortcuts: ['mod', 'shift', 'J'],
  },
]

interface SectionSixProps extends VariantProps<typeof toggleVariants> {
  editor: Editor
  activeActions?: TextAlignAction[]
  mainActionCount?: number
}

export const SectionSix: React.FC<SectionSixProps> = ({
  editor,
  activeActions = formatActions.map((action) => action.value),
  mainActionCount = 0,
  size,
  variant,
}) => {
  return (
    <ToolbarSection
      editor={editor}
      actions={formatActions}
      activeActions={activeActions}
      mainActionCount={mainActionCount}
      dropdownTooltip='Text alignment'
      size={size}
      variant={variant}
    />
  )
}

SectionSix.displayName = 'SectionSix'

export default SectionSix
