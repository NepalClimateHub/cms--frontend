import { useGetIkAuthParams } from "@/query/imagekit/use-ik"
import IKContext from "./image-kit/IKContext"
import IKUpload from "./image-kit/IKUpload"
import { MiniLoader } from "./loader"
import { toast } from "@/hooks/use-toast"
import { FC, useState } from "react"
import { XCircle } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { imagekit } from "@/query/shared/routes"

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
]

const bytesToMB = (bytes: number) => Math.floor(bytes / 1000000)

type ImageUploadProps = {
  label: string;
  handleImage: (imageId: string | null, imageURL: string | null) => void
}

const ImageUpload: FC<ImageUploadProps> = ({
  label,
  handleImage
}) => {
  const queryClient = useQueryClient()
  const [isUploading, setIsUploading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [imageURL, setImageURL] = useState<string | null>(null)
  const [imageId, setImageId] = useState<string | null>(null)

  const { data, isLoading } = useGetIkAuthParams()

  const endpoint = data?.data?.endpoint;
  const publicKey = data?.data?.publicKey;
  const ikAuthParams = data?.data?.ikAuthParams;
  const folder = data?.data?.folder;

  const handleUploadStart = () => {
    setIsError(false)
    setIsUploading(true)
  }

  const handleError = () => {
    setIsUploading(false)
    setIsError(true)
    toast({
      variant: "destructive",
      title: "Upload failed. Please try again.",
    })
  }

  const handleUploadSuccess = (data: any) => {
    queryClient.invalidateQueries({
      queryKey: [imagekit.getauthparams.key],
      exact: false
    })
    setIsUploading(false)
    setIsError(false)
    setImageURL(data?.url)
    setImageId(data?.fileId)
    handleImage(data?.fileId, data?.url)
    toast({
      variant: "default",
      title: "Uploaded successfully!",
    })
  }

  const handleRemoveImage = () => {
    setImageURL(null)
    setImageId(null)
    handleImage(null, null)
  }

  return (
    // <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 my-4 bg-white shadow-sm">
    <div className="inline-flex border-2 border-dashed border-gray-300 rounded-lg p-6 my-4 bg-white shadow-sm transition-all duration-300">
      <MiniLoader isLoading={isLoading}>
        <IKContext
          publicKey={publicKey}
          urlEndpoint={endpoint}
          authenticator={() => new Promise((resolve) => resolve(ikAuthParams))}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-start gap-8">
              {/* Upload Input */}
              <IKUpload
                disabled={!!imageId || !!imageURL}
                isUploading={isUploading}
                label={label}
                description="Image size should not exceed 5MB!"
                folder={folder}
                isPrivateFile={false}
                useUniqueFileName={true}
                onError={handleError}
                onSuccess={handleUploadSuccess}
                onUploadStart={handleUploadStart}
                validateFile={(file: File) => {
                  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                    toast({
                      variant: "destructive",
                      title: "Only jpg, png, and webp formats are supported.",
                    })
                    return false
                  }
                  if (bytesToMB(file.size) > 5) {
                    toast({
                      variant: "destructive",
                      title: "Image size cannot be greater than 5MB.",
                    })
                    return false
                  }
                  return true
                }}
                checks={`"file.size" < "5mb"`}
              />

              {/* Image Preview */}
              {imageURL && (
                <div className="relative">
                  <img
                    src={imageURL}
                    alt="Uploaded preview"
                    className="w-32 h-32 object-cover rounded-md shadow-md"
                  />

                  <XCircle onClick={handleRemoveImage} width={20} height={20} className="absolute top-1 right-1 text-red-500 cursor-pointer hover:text-red-600" />
                </div>
              )}
            </div>


            {/* Error Message */}
            {isError && (
              <div className="text-sm text-red-500 flex items-center gap-2">
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
