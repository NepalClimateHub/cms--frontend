import type { Editor } from '@tiptap/react'
import { Upload } from 'lucide-react'
import * as React from 'react'
import { Button } from '@/ui/shadcn/button'
import { Input } from '@/ui/shadcn/input'
import { Label } from '@/ui/shadcn/label'
import { isAltValid } from '../../extensions/image/image-attrs'
import { pickImageFile } from '../../extensions/image/upload/pick-image-file'
import { type ImageMeta, ImageMetaFields } from './image-meta-fields'

interface ImageEditBlockProps {
  editor: Editor
  close: () => void
}

export const ImageEditBlock: React.FC<ImageEditBlockProps> = ({
  editor,
  close,
}) => {
  const [link, setLink] = React.useState('')
  const [meta, setMeta] = React.useState<ImageMeta>({
    alt: '',
    caption: '',
    credit: '',
  })
  const altValid = isAltValid(meta.alt)
  const captionValid = meta.caption.trim() !== ''
  const imageMetaValid = altValid && captionValid

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (link && imageMetaValid) {
      editor.commands.setImages([{ src: link, ...meta }])
      close()
    }
  }

  const handleUpload = () => {
    pickImageFile('image/*', (file) => {
      editor.commands.setImages([{ src: file, ...meta }])
      close()
    })
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <ImageMetaFields
        idPrefix='insert-image'
        value={meta}
        onChange={setMeta}
        requireCaption
      />

      <div className='space-y-3'>
        <Label>Upload from your computer</Label>
        <Button
          type='button'
          variant='outline'
          disabled={!imageMetaValid}
          onClick={handleUpload}
        >
          <Upload className='mr-2 size-4' />
          Choose image
        </Button>
        <p className='text-sm text-muted-foreground'>
          Image size should not exceed 5MB.
        </p>
      </div>

      <div className='space-y-1'>
        <Label htmlFor='image-link'>Or attach an image link</Label>
        <div className='flex'>
          <Input
            id='image-link'
            type='url'
            required
            placeholder='https://ik.imagekit.io/...'
            value={link}
            className='grow'
            onChange={(e) => setLink(e.target.value)}
          />
          <Button type='submit' className='ml-2' disabled={!imageMetaValid}>
            Submit
          </Button>
        </div>
      </div>
    </form>
  )
}

export default ImageEditBlock
