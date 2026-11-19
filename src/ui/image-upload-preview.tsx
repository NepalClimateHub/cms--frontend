import { XCircle } from 'lucide-react'
import type { FC } from 'react'
import { Button } from '@/ui/shadcn/button'

type ImageUploadPreviewProps = {
  url: string
  disabled: boolean
  onRemove: () => void
}

export const ImageUploadPreview: FC<ImageUploadPreviewProps> = ({
  url,
  disabled,
  onRemove,
}) => (
  <div className='relative'>
    <img
      src={url}
      alt='Uploaded preview'
      className='h-32 w-32 rounded-md object-cover shadow-md'
    />
    <Button
      type='button'
      variant='ghost'
      size='icon'
      aria-label='Remove image'
      data-testid='banner-remove'
      disabled={disabled}
      onClick={onRemove}
      className='absolute right-1 top-1 h-6 w-6 rounded-full bg-white/80 text-red-500 hover:bg-white hover:text-red-600'
    >
      <XCircle />
    </Button>
  </div>
)
