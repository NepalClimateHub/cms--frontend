import type { FC } from 'react'
import { getIkAuthParams } from '@/query/imagekit/ik-service'
import { useGetIkAuthParams } from '@/query/imagekit/use-ik'
import IKContext from '@/ui/molecules/image-kit/IKContext'
import IKUpload from '@/ui/molecules/image-kit/IKUpload'
import { ImageUploadPreview } from './image-upload-preview'
import { MiniLoader } from './loader'
import { useImageUpload } from './use-image-upload'

type ImageUploadProps = {
  label: string
  handleImage: (imageId: string | null, imageURL: string | null) => void
  className?: string
  initialImageId?: string | null
  initialImageUrl?: string | null
  inputId?: string
  onBusyChange?: (busy: boolean) => void
}

const authenticator = async () => {
  const result = await getIkAuthParams()
  return result.data.ikAuthParams
}

const ImageUpload: FC<ImageUploadProps> = ({
  label,
  handleImage,
  className,
  initialImageId,
  initialImageUrl,
  inputId,
  onBusyChange,
}) => {
  const upload = useImageUpload({
    initialImageId,
    initialImageUrl,
    handleImage,
    onBusyChange,
  })
  const { data, isLoading } = useGetIkAuthParams()

  return (
    <div
      className={`my-4 inline-flex rounded-lg border-2 border-dashed border-gray-300 bg-white p-6 shadow-sm transition-all duration-300 ${className ?? ''}`}
    >
      <MiniLoader isLoading={isLoading}>
        <IKContext
          publicKey={data?.data?.publicKey}
          urlEndpoint={data?.data?.endpoint}
          authenticator={authenticator}
        >
          <div className='space-y-4'>
            <div className='flex items-center justify-start gap-8'>
              <IKUpload
                key={upload.inputKey}
                isUploading={upload.isUploading}
                label={upload.imageURL ? `Replace: ${label}` : label}
                description='JPG, PNG or WebP, up to 5 MB (5,000,000 bytes).'
                folder={data?.data?.folder}
                isPrivateFile={false}
                useUniqueFileName={true}
                onError={upload.handleError}
                onSuccess={upload.handleUploadSuccess}
                onUploadStart={upload.handleUploadStart}
                inputId={inputId}
                validateFile={upload.validateFile}
                checks={`"file.size" < "6mb"`}
              />
              {upload.imageURL && (
                <ImageUploadPreview
                  url={upload.imageURL}
                  disabled={upload.isUploading}
                  onRemove={upload.handleRemove}
                />
              )}
            </div>
            {upload.error && (
              <p role='alert' className='text-sm text-red-500'>
                {upload.error}
              </p>
            )}
          </div>
        </IKContext>
      </MiniLoader>
    </div>
  )
}

export default ImageUpload
