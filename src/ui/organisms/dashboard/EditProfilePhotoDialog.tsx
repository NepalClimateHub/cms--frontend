import { useState, useEffect } from 'react'
import { useGetProfile } from '@/query/auth/use-auth'
import { useUpdateProfile } from '@/query/users/use-users'
import ImageUpload from '@/ui/image-upload'
import { Button } from '@/ui/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/ui/shadcn/dialog'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { toast } from '@/hooks/use-toast'
import { mapUserOutputToAuthUser } from '@/utils/map-user-output'

interface EditProfilePhotoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called after a successful save (e.g. to refetch user in a parent view). */
  onPhotoUpdated?: () => void
}

export default function EditProfilePhotoDialog({
  open,
  onOpenChange,
  onPhotoUpdated,
}: EditProfilePhotoDialogProps) {
  const { user, setUser } = useAuthStore()
  const updateProfileMutation = useUpdateProfile()
  const { refetch: refetchProfile } = useGetProfile()
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null)
  const [profilePhotoId, setProfilePhotoId] = useState<string | null>(null)

  // Reset when dialog opens
  useEffect(() => {
    if (open && user) {
      // Get profile photo from user if available
      setProfilePhotoUrl(user.profilePhotoUrl || null)
      setProfilePhotoId(user.profilePhotoId || null)
    }
  }, [open, user])

  const handleImageUpload = (
    imageId: string | null,
    imageURL: string | null
  ) => {
    setProfilePhotoId(imageId)
    setProfilePhotoUrl(imageURL)
  }

  const handleSave = () => {
    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'User ID not found',
        variant: 'destructive',
      })
      return
    }

    if (!profilePhotoId || !profilePhotoUrl) {
      toast({
        title: 'Error',
        description: 'Please upload a profile photo',
        variant: 'destructive',
      })
      return
    }

    updateProfileMutation.mutate(
      {
        body: {
          profilePhotoUrl: profilePhotoUrl ?? undefined,
          profilePhotoId: profilePhotoId ?? undefined,
        },
      },
      {
        onSuccess: async () => {
          const profileRes = await refetchProfile()
          if (profileRes.data) {
            setUser(
              mapUserOutputToAuthUser(
                profileRes.data,
                user?.organization ?? null
              )
            )
          }
          onOpenChange(false)
          onPhotoUpdated?.()
          toast({
            title: 'Success',
            description: 'Profile photo updated successfully',
            variant: 'default',
          })
        },
        onError: () => {
          toast({
            title: 'Error',
            description: 'Failed to update profile photo. Please try again.',
            variant: 'destructive',
          })
        },
      }
    )
  }

  const handleCancel = () => {
    setProfilePhotoUrl(null)
    setProfilePhotoId(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='border-0 bg-white shadow-none sm:max-w-[500px]'>
        <DialogHeader className='pb-2 text-center'>
          <DialogTitle className='text-2xl font-bold text-gray-900 sm:text-3xl'>
            Update Profile Photo
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          <ImageUpload
            label='Upload profile photo'
            handleImage={handleImageUpload}
            initialImageId={profilePhotoId}
            initialImageUrl={profilePhotoUrl}
            inputId='profile-photo-upload'
          />

          <div className='flex justify-end space-x-3 pt-6'>
            <Button
              type='button'
              variant='outline'
              onClick={handleCancel}
              disabled={updateProfileMutation.isPending}
              className='h-10 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            >
              Cancel
            </Button>
            <Button
              type='button'
              onClick={handleSave}
              disabled={updateProfileMutation.isPending || !profilePhotoId}
              className='h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            >
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Updating...
                </>
              ) : (
                'Save Photo'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
