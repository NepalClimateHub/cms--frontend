import type * as React from 'react'
import { cn } from '@/ui/shadcn/lib/utils'
import type { ResizeCorner, useImageResize } from '../hooks/use-image-resize'

type Handlers = ReturnType<typeof useImageResize>['handlers']

const CORNERS: Array<{ corner: ResizeCorner; label: string; place: string }> = [
  {
    corner: 'nw',
    label: 'top left',
    place: '-left-1.5 -top-1.5 cursor-nwse-resize',
  },
  {
    corner: 'ne',
    label: 'top right',
    place: '-right-1.5 -top-1.5 cursor-nesw-resize',
  },
  {
    corner: 'sw',
    label: 'bottom left',
    place: '-bottom-1.5 -left-1.5 cursor-nesw-resize',
  },
  {
    corner: 'se',
    label: 'bottom right',
    place: '-bottom-1.5 -right-1.5 cursor-nwse-resize',
  },
]

interface ImageResizeHandlesProps {
  handlers: Handlers
  width: number | null
}

export const ImageResizeHandles: React.FC<ImageResizeHandlesProps> = ({
  handlers,
  width,
}) => (
  <>
    {CORNERS.map(({ corner, label, place }) => (
      <button
        key={corner}
        type='button'
        data-testid={`image-resize-${corner}`}
        aria-label={`Resize image from ${label} corner. Use left and right arrow keys.`}
        className={cn(
          'absolute z-10 size-3 touch-none rounded-sm border-2 border-primary bg-background',
          place
        )}
        onPointerDown={handlers.startDrag(corner)}
        onPointerMove={handlers.drag}
        onPointerUp={handlers.endDrag}
        onPointerCancel={handlers.endDrag}
        onKeyDown={handlers.resizeByKey}
      />
    ))}
    {width !== null && (
      <span
        aria-hidden='true'
        className='pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded bg-foreground/80 px-1.5 py-0.5 text-xs text-background'
      >
        {width}px
      </span>
    )}
  </>
)
