import * as React from 'react'
import { Button } from '@/ui/shadcn/button'
import { Input } from '@/ui/shadcn/input'
import { Label } from '@/ui/shadcn/label'
import type { Editor } from '@tiptap/react'
import { useGetIkAuthParams } from '@/query/imagekit/use-ik'
import IKContext from '@/ui/image-kit/IKContext'
import IKUpload from '@/ui/image-kit/IKUpload'
import { MiniLoader } from '@/ui/loader'
import { toast } from '@/hooks/use-toast'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

interface ImageEditBlockProps {
  editor: Editor
  close: () => void
}

export const ImageEditBlock: React.FC<ImageEditBlockProps> = ({
  editor,
  close,
}) => {
  const [link, setLink] = React.useState('')
  const [caption, setCaption] = React.useState('')
  const [isUploading, setIsUploading] = React.useState(false)
  const { data, isLoading } = useGetIkAuthParams()

  const endpoint = data?.data?.endpoint
  const publicKey = data?.data?.publicKey
  const ikAuthParams = data?.data?.ikAuthParams
  const folder = data?.data?.folder

  const handleSubmit = React.useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      e.stopPropagation()

      if (link) {
        editor.commands.setImages([{ src: link, caption: caption || undefined }])
        close()
      }
    },
    [editor, link, caption, close]
  )

  const handleUploadStart = () => {
    setIsUploading(true)
  }

  const handleUploadError = () => {
    setIsUploading(false)
    toast({
      variant: 'destructive',
      title: 'Upload failed. Please try again.',
    })
  }

  const handleUploadSuccess = (uploaded: any) => {
    setIsUploading(false)
    const url = uploaded?.url
    if (url) {
      editor.commands.setImages([{ src: url, caption: caption || undefined }])
      toast({
        variant: 'default',
        title: 'Image added to content',
      })
      close()
    } else {
      handleUploadError()
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <div className='space-y-1'>
        <Label htmlFor='image-link'>Attach an image link</Label>
        <div className='flex'>
          <Input
            id='image-link'
            type='url'
            required
            placeholder='https://example.com'
            value={link}
            className='grow'
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setLink(e.target.value)
            }
          />
          <Button type='submit' className='ml-2'>
            Submit
          </Button>
        </div>
      </div>

      <div className='space-y-1'>
        <Label htmlFor='image-caption'>Image Caption (optional)</Label>
        <Input
          id='image-caption'
          type='text'
          placeholder='Enter a caption for this image...'
          value={caption}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setCaption(e.target.value)
          }
        />
      </div>

      <div className='space-y-3'>
        <Label>Or upload from your computer</Label>
        <MiniLoader isLoading={isLoading}>
          <IKContext
            publicKey={publicKey}
            urlEndpoint={endpoint}
            authenticator={() => new Promise((resolve) => resolve(ikAuthParams))}
          >
            <IKUpload
              disabled={isUploading}
              isUploading={isUploading}
              label='Upload image'
              description='Image size should not exceed 5MB!'
              folder={folder}
              isPrivateFile={false}
              useUniqueFileName={true}
              onError={handleUploadError}
              onSuccess={handleUploadSuccess}
              onUploadStart={handleUploadStart}
              validateFile={(file: File) => {
                if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                  toast({
                    variant: 'destructive',
                    title: 'Only jpg, png, and webp formats are supported.',
                  })
                  return false
                }
                const sizeInMb = Math.floor(file.size / 1000000)
                if (sizeInMb > 5) {
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
          </IKContext>
        </MiniLoader>
      </div>
    </form>
  )
}

export default ImageEditBlock
