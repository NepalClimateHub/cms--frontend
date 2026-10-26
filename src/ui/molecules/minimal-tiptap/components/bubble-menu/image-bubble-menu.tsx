import type { Editor } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react'
import { AlignCenter, AlignLeft, AlignRight, X, type LucideIcon } from 'lucide-react'
import type * as React from 'react'
import { Button } from '@/ui/shadcn/button'
import type { ImageLayout } from '../../extensions/image/image-attrs'
import { getSelectedImage } from '../../extensions/image/image-layout'
import { ImageDetailsPopover } from './image-details-popover'
import { ImageLayoutToggle } from './image-layout-toggle'

interface ImageBubbleMenuProps {
  editor: Editor
}

const ALIGNMENTS: ReadonlyArray<{
  value: 'left' | 'center' | 'right'
  label: string
  icon: LucideIcon
}> = [
  { value: 'left', label: 'Align image left', icon: AlignLeft },
  { value: 'center', label: 'Center image', icon: AlignCenter },
  { value: 'right', label: 'Align image right', icon: AlignRight },
]

export const ImageBubbleMenu: React.FC<ImageBubbleMenuProps> = ({ editor }) => {
  const selected = getSelectedImage(editor.state)
  const attrs = selected?.node.attrs

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={() =>
        editor.isEditable && getSelectedImage(editor.state) !== null
      }
      tippyOptions={{ placement: 'top' }}
    >
      <div className='flex items-center gap-1 rounded-md border bg-background p-1 shadow-md'>
        <ImageLayoutToggle
          value={selected?.layout ?? 'inline'}
          canSet={(layout: ImageLayout) => editor.can().setImageLayout(layout)}
          onChange={(layout) => {
            const chain = editor.chain().focus().setImageLayout(layout)
            if (layout !== 'two-up') {
              chain.updateAttributes('image', { width: null, height: null })
            }
            chain.run()
          }}
        />
        <div className='flex items-center border-l pl-1'>
          {ALIGNMENTS.map(({ value: alignment, label, icon: Icon }) => (
            <Button
              key={alignment}
              type='button'
              size='icon'
              variant='ghost'
              className='size-8'
              aria-label={label}
              aria-pressed={attrs?.alignment === alignment}
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .setImage({ alignment })
                  .run()
              }
            >
              <Icon className='size-4' />
            </Button>
          ))}
        </div>
        <ImageDetailsPopover
          initial={{
            alt: attrs?.alt ?? '',
            caption: attrs?.caption ?? '',
            credit: attrs?.credit ?? '',
          }}
          onSave={(value) => editor.chain().focus().setImage(value).run()}
        />
        <Button
          type='button'
          size='icon'
          variant='ghost'
          className='size-8'
          aria-label='Remove image'
          onClick={() => editor.chain().focus().deleteSelection().run()}
        >
          <X className='size-4' />
        </Button>
      </div>
    </BubbleMenu>
  )
}

export default ImageBubbleMenu
