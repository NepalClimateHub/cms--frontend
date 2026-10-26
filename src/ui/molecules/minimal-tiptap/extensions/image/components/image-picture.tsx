import type * as React from 'react'
import { cn } from '@/ui/shadcn/lib/utils'
import type { ImageAttrs } from '../image-attrs'

interface ImagePictureProps {
  attrs: ImageAttrs
  hidden: boolean
  onNaturalSize: (width: number, height: number) => void
  onError: () => void
}

export const ImagePicture: React.FC<ImagePictureProps> = ({
  attrs,
  hidden,
  onNaturalSize,
  onError,
}) => (
  // biome-ignore lint/a11y/noNoninteractiveElementInteractions: image load errors must be handled.
  <img
    className={cn('block h-auto w-full rounded', { 'opacity-0': hidden })}
    src={attrs.src ?? undefined}
    alt={attrs.alt ?? ''}
    draggable={false}
    onLoad={(e) =>
      onNaturalSize(e.currentTarget.naturalWidth, e.currentTarget.naturalHeight)
    }
    onError={onError}
  />
)
