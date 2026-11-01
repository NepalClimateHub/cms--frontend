import type * as React from 'react'
import { Controlled as ControlledZoom } from 'react-medium-image-zoom'
import { cn } from '@/ui/shadcn/lib/utils'
import type { ImageAttrs } from '../image-attrs'

interface ImagePictureProps {
  attrs: ImageAttrs
  isZoomed: boolean
  hidden: boolean
  onZoomChange: (zoomed: boolean) => void
  onNaturalSize: (width: number, height: number) => void
  onError: () => void
}

export const ImagePicture: React.FC<ImagePictureProps> = ({
  attrs,
  isZoomed,
  hidden,
  onZoomChange,
  onNaturalSize,
  onError,
}) => (
  <ControlledZoom isZoomed={isZoomed} onZoomChange={onZoomChange}>
    {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: image load errors must be handled. */}
    <img
      className={cn('block h-auto w-full rounded', { 'opacity-0': hidden })}
      src={attrs.src ?? undefined}
      alt={attrs.alt ?? ''}
      width={attrs.width ?? undefined}
      height={attrs.height ?? undefined}
      onLoad={(e) =>
        onNaturalSize(
          e.currentTarget.naturalWidth,
          e.currentTarget.naturalHeight
        )
      }
      onError={onError}
    />
  </ControlledZoom>
)
