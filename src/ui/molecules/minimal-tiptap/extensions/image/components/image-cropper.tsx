import type * as React from 'react'
import Cropper from 'react-easy-crop'
import { Button } from '@/ui/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/shadcn/dialog'
import { useImageCrop } from '../hooks/use-image-crop'
import type { UploadStartResult } from '../upload/prepare-upload'

interface ImageCropperProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageSrc: string
  onCropComplete: (croppedBlob: Blob) => UploadStartResult
}

export const ImageCropper: React.FC<ImageCropperProps> = ({
  open,
  onOpenChange,
  imageSrc,
  onCropComplete,
}) => {
  const state = useImageCrop({ open, imageSrc, onOpenChange, onCropComplete })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex h-[600px] flex-col sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
        </DialogHeader>
        <div className='relative flex-1 overflow-hidden rounded-md bg-black'>
          <Cropper
            image={imageSrc}
            crop={state.crop}
            zoom={state.zoom}
            aspect={undefined}
            onCropChange={state.setCrop}
            onCropComplete={(_area, pixels) => state.setArea(pixels)}
            onZoomChange={state.setZoom}
          />
        </div>
        {state.error && (
          <p role='alert' className='text-sm text-destructive'>
            {state.error}
          </p>
        )}
        <div className='flex items-center gap-4 px-2 py-2'>
          <span className='text-sm font-medium'>Zoom</span>
          <input
            type='range'
            value={state.zoom}
            min={1}
            max={3}
            step={0.1}
            onChange={(e) => state.setZoom(parseFloat(e.target.value))}
            className='h-1.5 flex-1 cursor-pointer appearance-none rounded-lg bg-secondary accent-primary'
          />
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={state.apply} disabled={!state.canApply}>
            {state.isLoading ? 'Cropping...' : 'Apply Crop'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
