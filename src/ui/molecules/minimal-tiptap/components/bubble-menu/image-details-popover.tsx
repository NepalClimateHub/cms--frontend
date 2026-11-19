import { Pencil } from 'lucide-react'
import * as React from 'react'
import { Button } from '@/ui/shadcn/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/shadcn/popover'
import { isAltValid } from '../../extensions/image/image-attrs'
import { type ImageMeta, ImageMetaFields } from '../image/image-meta-fields'

interface ImageDetailsPopoverProps {
  initial: ImageMeta
  onSave: (value: ImageMeta) => void
}

export const ImageDetailsPopover: React.FC<ImageDetailsPopoverProps> = ({
  initial,
  onSave,
}) => {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState(initial)

  const handleOpenChange = (next: boolean) => {
    if (next) setValue(initial)
    setOpen(next)
  }

  const handleSave = () => {
    if (!isAltValid(value.alt)) return
    onSave(value)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          size='icon'
          variant='ghost'
          className='size-8'
          aria-label='Edit image details'
        >
          <Pencil className='size-4' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-80 space-y-3' align='start'>
        <ImageMetaFields
          idPrefix='bubble-image'
          value={value}
          onChange={setValue}
        />
        <div className='flex justify-end gap-2'>
          <Button
            type='button'
            size='sm'
            variant='outline'
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type='button'
            size='sm'
            disabled={!isAltValid(value.alt)}
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
