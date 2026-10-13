import { type NodeViewProps, NodeViewWrapper } from '@tiptap/react'
import type * as React from 'react'
import { cn } from '@/ui/shadcn/lib/utils'
import { useImageBlock } from '../hooks/use-image-block'
import { isPersistableSrc } from '../image-attrs'
import { ImageActions } from './image-actions'
import { ImageCropper } from './image-cropper'
import { ImageFigcaption } from './image-figcaption'
import { ImagePicture } from './image-picture'
import { ImageStatusOverlay } from './image-status-overlay'

export const ImageViewBlock: React.FC<NodeViewProps> = (props) => {
  const block = useImageBlock(props)
  const { attrs, upload, actions } = block

  return (
    <NodeViewWrapper
      as='figure'
      data-testid='editor-image'
      data-drag-handle
      data-layout={attrs.layout === 'inline' ? undefined : attrs.layout}
      data-alt-missing={block.altMissing || undefined}
      className='image-block group/node-image'
    >
      <div
        className={cn('relative rounded', {
          'outline outline-2 outline-offset-1 outline-primary': props.selected,
        })}
      >
        <ImagePicture
          attrs={{ ...attrs, src: block.displaySrc }}
          isZoomed={block.isZoomed}
          hidden={block.loadFailed}
          onZoomChange={block.setIsZoomed}
          onNaturalSize={block.handleNaturalSize}
          onError={() => block.setLoadFailed(true)}
        />
        <ImageStatusOverlay
          state={upload.state}
          loadFailed={block.loadFailed}
          canRetry={upload.canRetry}
          canCancel={isPersistableSrc(attrs.src)}
          onRetry={upload.retry}
          onCancel={upload.cancel}
          onRemove={props.deleteNode}
        />
        {!block.loadFailed && !block.busy && <ImageActions {...actions} />}
      </div>
      <ImageFigcaption
        caption={attrs.caption}
        credit={attrs.credit}
        altMissing={block.altMissing}
      />
      <ImageCropper
        open={block.isCropperOpen}
        onOpenChange={block.setIsCropperOpen}
        imageSrc={block.displaySrc ?? ''}
        onCropComplete={block.handleCrop}
      />
    </NodeViewWrapper>
  )
}
