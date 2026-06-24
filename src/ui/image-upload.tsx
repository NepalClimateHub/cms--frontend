import { FC, useState } from 'react'
import { useGetIkAuthParams } from '@/query/imagekit/use-ik'
import { getIkAuthParams } from '@/query/imagekit/ik-service'
import { XCircle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import IKContext from '@/ui/molecules/image-kit/IKContext'
import IKUpload from '@/ui/molecules/image-kit/IKUpload'
import { MiniLoader } from './loader'

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]

const bytesToMB = (bytes: number) => Math.floor(bytes / 1000000)

type ImageUploadProps = {
  label: string
  handleImage: (imageId: string | null, imageURL: string | null) => void
  className?: string
  initialImageId?: string | null
  initialImageUrl?: string | null
  inputId?: string
}

const ImageUpload: FC<ImageUploadProps> = ({
  label,
  handleImage,
  className,
  initialImageId,
  initialImageUrl,
  inputId,
}) => {
  const [isUploading, setIsUploading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [imageURL, setImageURL] = useState<string | null>(
    initialImageUrl || null
  )
  const [imageId, setImageId] = useState<string | null>(initialImageId || null)

  // Only used for stable config values (endpoint, publicKey, folder) — these don't expire
  const { data, isLoading } = useGetIkAuthParams()

  const endpoint = data?.data?.endpoint
  const publicKey = data?.data?.publicKey
  const folder = data?.data?.folder

  const handleUploadStart = () => {
    setIsError(false)
    setIsUploading(true)
  }

  const handleError = (err?: Error) => {
    setIsUploading(false)
    setIsError(true)
    const isGenericMessage = !err?.message || err.message === '[object Object]'
    toast({
      variant: 'destructive',
      title: 'Image upload failed',
      description: isGenericMessage
        ? 'Something went wrong. Please try again.'
        : err.message,
    })
  }

  const handleUploadSuccess = (data: { url?: string; fileId?: string }) => {
    setIsUploading(false)
    setIsError(false)
    setImageURL(data?.url ?? null)
    setImageId(data?.fileId ?? null)
    handleImage(data?.fileId ?? null, data?.url ?? null)
    toast({
      variant: 'default',
      title: 'Uploaded successfully!',
    })
  }

  const handleRemoveImage = () => {
    setImageURL(null)
    setImageId(null)
    handleImage(null, null)
  }

  // Called by ImageKit SDK right before each upload — always fetches fresh credentials
  const authenticator = async () => {
    const result = await getIkAuthParams()
    return result.data.ikAuthParams
  }

  return (
    <div
      className={`my-4 inline-flex rounded-lg border-2 border-dashed border-gray-300 bg-white p-6 shadow-sm transition-all duration-300 ${className}`}
    >
      <MiniLoader isLoading={isLoading}>
        <IKContext
          publicKey={publicKey}
          urlEndpoint={endpoint}
          authenticator={authenticator}
        >
          <div className='space-y-4'>
            <div className='flex items-center justify-start gap-8'>
              {/* Upload Input */}
              <IKUpload
                disabled={!!imageId || !!imageURL}
                isUploading={isUploading}
                label={label}
                description='Image size should not exceed 5MB!'
                folder={folder}
                isPrivateFile={false}
                useUniqueFileName={true}
                onError={handleError}
                onSuccess={handleUploadSuccess}
                onUploadStart={handleUploadStart}
                inputId={inputId}
                validateFile={(file: File) => {
                  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                    toast({
                      variant: 'destructive',
                      title: 'Only jpg, png, and webp formats are supported.',
                    })
                    return false
                  }
                  if (bytesToMB(file.size) > 5) {
                    toast({
                      variant: 'destructive',
                      title: 'Image size cannot be greater than 5MB.',
                    })
                    return false
                  }
                  return true
                }}
                checks={`"file.size" < "5mb"`}
              />

              {/* Image Preview */}
              {imageURL && (
                <div className='relative'>
                  <img
                    src={imageURL}
                    alt='Uploaded preview'
                    className='h-32 w-32 rounded-md object-cover shadow-md'
                  />

                  <XCircle
                    onClick={handleRemoveImage}
                    width={20}
                    height={20}
                    className='absolute right-1 top-1 cursor-pointer text-red-500 hover:text-red-600'
                  />
                </div>
              )}
            </div>

            {/* Error Message */}
            {isError && (
              <div className='flex items-center gap-2 text-sm text-red-500'>
                Upload failed. Please try again.
              </div>
            )}
          </div>
        </IKContext>
      </MiniLoader>
    </div>
  )
}

export default ImageUpload
