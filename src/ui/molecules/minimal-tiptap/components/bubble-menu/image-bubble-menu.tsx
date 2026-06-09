import * as React from 'react'
import type { Editor } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react'
import { X, Pencil } from 'lucide-react'
import { Button } from '@/ui/shadcn/button'
import { Input } from '@/ui/shadcn/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/shadcn/popover'
import { Label } from '@/ui/shadcn/label'

interface ImageBubbleMenuProps {
  editor: Editor
}

export const ImageBubbleMenu: React.FC<ImageBubbleMenuProps> = ({ editor }) => {
  const [isEditingCaption, setIsEditingCaption] = React.useState(false)
  const [caption, setCaption] = React.useState('')

  if (!editor) return null

  const shouldShow = () => {
    return editor.isActive('image') && editor.isEditable
  }

  const handleRemove = () => {
    editor.chain().focus().deleteSelection().run()
  }

  const handleEditCaption = () => {
    const attrs = editor.getAttributes('image')
    setCaption(attrs.caption || '')
    setIsEditingCaption(true)
  }

  const handleSaveCaption = () => {
    const attrs = editor.getAttributes('image')
    editor.chain().focus().setImage({ ...attrs, caption: caption || null }).run()
    setIsEditingCaption(false)
  }

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={shouldShow}
      tippyOptions={{
        placement: 'top',
      }}
    >
      <div className='flex items-center gap-2 rounded-md border bg-background p-1 shadow-md'>
        <Popover open={isEditingCaption} onOpenChange={setIsEditingCaption}>
          <PopoverTrigger asChild>
            <Button
              type='button'
              size='icon'
              variant='ghost'
              className='h-7 w-7'
              onClick={handleEditCaption}
            >
              <Pencil className='h-4 w-4' />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-80' align='start'>
            <div className='space-y-2'>
              <Label htmlFor='edit-caption'>Edit Caption</Label>
              <Input
                id='edit-caption'
                type='text'
                placeholder='Enter caption...'
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveCaption()
                  }
                }}
              />
              <div className='flex justify-end gap-2'>
                <Button
                  type='button'
                  size='sm'
                  variant='outline'
                  onClick={() => setIsEditingCaption(false)}
                >
                  Cancel
                </Button>
                <Button type='button' size='sm' onClick={handleSaveCaption}>
                  Save
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <Button
          type='button'
          size='icon'
          variant='ghost'
          className='h-7 w-7'
          onClick={handleRemove}
        >
          <X className='h-4 w-4' />
        </Button>
      </div>
    </BubbleMenu>
  )
}

export default ImageBubbleMenu


