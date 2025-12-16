import * as React from 'react'
import type { Editor } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react'
import { X } from 'lucide-react'
import { Button } from '@/ui/shadcn/button'

interface ImageBubbleMenuProps {
  editor: Editor
}

export const ImageBubbleMenu: React.FC<ImageBubbleMenuProps> = ({ editor }) => {
  if (!editor) return null

  const shouldShow = () => {
    return editor.isActive('image') && editor.isEditable
  }

  const handleRemove = () => {
    editor.chain().focus().deleteSelection().run()
  }

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={shouldShow}
      tippyOptions={{
        placement: 'top',
      }}
    >
      <Button
        type='button'
        size='icon'
        variant='outline'
        className='h-7 w-7 rounded-full'
        onClick={handleRemove}
      >
        <X className='h-4 w-4' />
      </Button>
    </BubbleMenu>
  )
}

export default ImageBubbleMenu


