import * as React from 'react'
import type { Area, Point } from 'react-easy-crop'
import { createImage, getCroppedImg } from '../../../utils'
import { CROP_LOAD_ERROR, describeCropError } from '../crop-messages'
import type { UploadStartResult } from '../upload/prepare-upload'

interface UseImageCropProps {
  open: boolean
  imageSrc: string
  onOpenChange: (open: boolean) => void
  onCropComplete: (croppedBlob: Blob) => UploadStartResult
}

export const useImageCrop = ({
  open,
  imageSrc,
  onOpenChange,
  onCropComplete,
}: UseImageCropProps) => {
  const [crop, setCrop] = React.useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = React.useState(1)
  const [area, setArea] = React.useState<Area | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) return
    let active = true
    setError(null)
    setArea(null)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    createImage(imageSrc).catch(() => {
      if (active) setError(CROP_LOAD_ERROR)
    })
    return () => {
      active = false
    }
  }, [open, imageSrc])

  const apply = async () => {
    if (!area) return
    setIsLoading(true)
    setError(null)
    try {
      const blob = await getCroppedImg(imageSrc, area)
      const result = onCropComplete(blob)
      if (result.ok) onOpenChange(false)
      else setError(result.message)
    } catch (e) {
      setError(describeCropError(e))
    } finally {
      setIsLoading(false)
    }
  }

  return {
    crop,
    zoom,
    error,
    isLoading,
    canApply: area !== null && !isLoading,
    setCrop,
    setZoom,
    setArea,
    apply,
  }
}
