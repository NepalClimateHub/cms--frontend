import { InfoCircledIcon } from '@radix-ui/react-icons'
import type * as React from 'react'
import { Button } from '@/ui/shadcn/button'
import { Progress } from '@/ui/shadcn/progress'
import type { UploadState } from '../upload/upload-task'

interface ImageStatusOverlayProps {
  state: UploadState | null
  loadFailed: boolean
  canRetry: boolean
  canCancel: boolean
  onRetry: () => void
  onCancel: () => void
  onRemove: () => void
}

const OVERLAY =
  'absolute inset-0 flex flex-col items-center justify-center gap-2 p-3'

export const ImageStatusOverlay: React.FC<ImageStatusOverlayProps> = ({
  state,
  loadFailed,
  canRetry,
  canCancel,
  onRetry,
  onCancel,
  onRemove,
}) => {
  if (state?.status === 'uploading' || state?.status === 'idle') {
    return (
      <div className={`${OVERLAY} bg-[var(--mt-overlay)]`} aria-live='polite'>
        <p className='text-sm'>Uploading {state.progress}%</p>
        <Progress value={state.progress} className='h-1.5 w-2/3' />
      </div>
    )
  }
  if (state?.status === 'error') {
    return (
      <div className={`${OVERLAY} bg-[var(--mt-overlay)]`} role='alert'>
        <InfoCircledIcon className='size-6 text-destructive' />
        <p className='text-sm'>Upload failed: {state.message}</p>
        <div className='flex gap-2'>
          {canRetry && (
            <Button type='button' size='sm' onClick={onRetry}>
              Retry
            </Button>
          )}
          <Button type='button' size='sm' variant='outline' onClick={onCancel}>
            {canCancel ? 'Keep original' : 'Remove'}
          </Button>
        </div>
      </div>
    )
  }
  if (!loadFailed) return null
  return (
    <div className={OVERLAY}>
      <InfoCircledIcon className='size-6 text-destructive' />
      <p className='text-sm text-muted-foreground'>Failed to load image</p>
      <Button type='button' size='sm' variant='outline' onClick={onRemove}>
        Remove
      </Button>
    </div>
  )
}
