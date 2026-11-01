import { useEffect, useState } from 'react'
import { toast } from '@/hooks/use-toast'
import { validateImageFile } from './image-upload-validation'

type UploadResult = { url?: string; fileId?: string }

type UseImageUploadArgs = {
  initialImageId?: string | null
  initialImageUrl?: string | null
  handleImage: (imageId: string | null, imageURL: string | null) => void
  onBusyChange?: (busy: boolean) => void
}

const GENERIC_ERROR = 'Something went wrong. Please try again.'

export const useImageUpload = ({
  initialImageId,
  initialImageUrl,
  handleImage,
  onBusyChange,
}: UseImageUploadArgs) => {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageURL, setImageURL] = useState<string | null>(
    initialImageUrl || null
  )
  const [imageId, setImageId] = useState<string | null>(initialImageId || null)
  const [inputKey, setInputKey] = useState(0)

  useEffect(() => {
    onBusyChange?.(isUploading)
  }, [isUploading, onBusyChange])

  const resetInput = () => setInputKey((key) => key + 1)

  const validateFile = (file: File) => {
    const result = validateImageFile(file)
    if (result.ok) return true
    setError(result.message)
    resetInput()
    return false
  }

  const handleUploadStart = () => {
    setError(null)
    setIsUploading(true)
  }

  const handleUploadSuccess = (data: UploadResult) => {
    setIsUploading(false)
    resetInput()
    if (!data?.url || !data.fileId) {
      setError('Upload finished without an image. Please try again.')
      return
    }
    setError(null)
    setImageURL(data.url)
    setImageId(data.fileId)
    handleImage(data.fileId, data.url)
    toast({ variant: 'default', title: 'Uploaded successfully!' })
  }

  const handleError = (err?: Error) => {
    setIsUploading(false)
    resetInput()
    const isGeneric = !err?.message || err.message === '[object Object]'
    const message = isGeneric ? GENERIC_ERROR : err.message
    setError(`Upload failed. ${message}`)
    toast({
      variant: 'destructive',
      title: 'Image upload failed',
      description: message,
    })
  }

  const handleRemove = () => {
    setError(null)
    setImageURL(null)
    setImageId(null)
    resetInput()
    handleImage(null, null)
  }

  return {
    imageId,
    imageURL,
    isUploading,
    error,
    inputKey,
    validateFile,
    handleUploadStart,
    handleUploadSuccess,
    handleError,
    handleRemove,
  }
}
