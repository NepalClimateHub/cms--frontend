import type { Editor } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react'
import { X } from 'lucide-react'
import type * as React from 'react'
import { Button } from '@/ui/shadcn/button'
import type { ImageLayout } from '../../extensions/image/image-attrs'
import { getSelectedImage } from '../../extensions/image/image-layout'
import { ImageDetailsPopover } from './image-details-popover'
import { ImageLayoutToggle } from './image-layout-toggle'

interface ImageBubbleMenuProps {
  editor: Editor
}

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
          onChange={(layout) =>
            editor.chain().focus().setImageLayout(layout).run()
          }
        />
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
