import { useEffect, useState } from 'react'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import apiClient from '@/query/apiClient'
import { useGetProfile } from '@/query/auth/use-auth'
import ImageUpload from '@/ui/image-upload'
import { Button } from '@/ui/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/ui/shadcn/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/shadcn/form'
import { Input } from '@/ui/shadcn/input'
import { Textarea } from '@/ui/shadcn/textarea'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { toast } from '@/hooks/use-toast'

const editProfileSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  bio: z
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  linkedin: z
    .string()
    .url({ message: 'Please enter a valid URL.' })
    .optional()
    .or(z.literal('')),
  currentRole: z
    .string()
    .max(100, 'Current Role must be less than 100 characters')
    .optional()
    .or(z.literal('')),
})

type EditProfileFormData = z.infer<typeof editProfileSchema>

interface EditProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProfileUpdated?: () => void
}

export default function EditProfileDialog({
  open,
  onOpenChange,
  onProfileUpdated,
}: EditProfileDialogProps) {
  const { user, setUser } = useAuthStore()
  const { data: profileData, refetch: refetchProfile } = useGetProfile()
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null)
  const [profilePhotoId, setProfilePhotoId] = useState<string | null>(null)

  const form = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: profileData?.fullName || user?.fullName || '',
      bio: (profileData as any)?.bio || (user as any)?.bio || '',
      linkedin: (profileData as any)?.linkedin || (user as any)?.linkedin || '',
      currentRole:
        (profileData as any)?.currentRole || (user as any)?.currentRole || '',
    },
  })

  // Reset profile photo when dialog opens
  useEffect(() => {
    if (open && profileData) {
      setProfilePhotoUrl((profileData as any)?.profilePhotoUrl || null)
      setProfilePhotoId((profileData as any)?.profilePhotoId || null)
    } else if (open && user) {
      setProfilePhotoUrl(user?.profilePhotoUrl || null)
      setProfilePhotoId(user?.profilePhotoId || null)
    }
  }, [open, profileData, user])

  // Reset form when dialog opens or profile data changes
  useEffect(() => {
    if (open && profileData) {
      form.reset({
        name: profileData.fullName || '',
        bio: (profileData as any)?.bio || '',
        linkedin: (profileData as any)?.linkedin || '',
        currentRole: (profileData as any)?.currentRole || '',
      })
    } else if (open && user) {
      form.reset({
        name: user.fullName || '',
        bio: (user as any)?.bio || '',
        linkedin: (user as any)?.linkedin || '',
        currentRole: (user as any)?.currentRole || '',
      })
    }
  }, [open, profileData, user, form])

  const onSubmit = async (data: EditProfileFormData) => {
    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'User ID not found',
        variant: 'destructive',
      })
      return
    }

    try {
      // Prepare update payload
      const updatePayload: any = {
        name: data.name,
        bio: data.bio || undefined,
        linkedin: data.linkedin || undefined,
        currentRole: data.currentRole || undefined,
      }

      // Include profile photo if it was changed
      if (profilePhotoId && profilePhotoUrl) {
        updatePayload.profilePhotoUrl = profilePhotoUrl
        updatePayload.profilePhotoId = profilePhotoId
      }

      // Use PATCH /me endpoint to update current user's profile
      await apiClient.patch('/api/v1/users/me', updatePayload)
      // Refetch profile to get updated user data
      const profileData = await refetchProfile()
      if (profileData.data) {
        // Map UserOutput to User type for auth store
        const updatedUser = {
          id: profileData.data.id,
          email: profileData.data.email,
          fullName: profileData.data.fullName,
          permissions: user?.permissions || [],
          isActive: profileData.data.isAccountVerified,
          isSuperAdmin: profileData.data.isSuperAdmin,
          organization: user?.organization || null,
          bio:
            (profileData.data as { bio?: string | null })?.bio ||
            user?.bio ||
            null,
          linkedin:
            (profileData.data as { linkedin?: string | null })?.linkedin ||
            user?.linkedin ||
            null,
          currentRole:
            (profileData.data as { currentRole?: string | null })
              ?.currentRole ||
            user?.currentRole ||
            null,
          profilePhotoUrl:
            (profileData.data as { profilePhotoUrl?: string | null })
              ?.profilePhotoUrl ||
            user?.profilePhotoUrl ||
            null,
          profilePhotoId:
            (profileData.data as { profilePhotoId?: string | null })
              ?.profilePhotoId ||
            user?.profilePhotoId ||
            null,
          createdAt: profileData.data.createdAt,
          updatedAt: profileData.data.updatedAt,
        }
        setUser(updatedUser)
      }
      form.reset()
      onOpenChange(false)
      // Trigger refetch in parent component if callback provided
      if (onProfileUpdated) {
        onProfileUpdated()
      }
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
        variant: 'default',
      })
    } catch (error) {
      console.error('Profile update error:', error)
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to update profile. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleCancel = () => {
    if (profileData) {
      form.reset({
        name: profileData.fullName || '',
        bio: (profileData as any)?.bio || '',
        linkedin: (profileData as any)?.linkedin || '',
        currentRole: (profileData as any)?.currentRole || '',
      })
    } else if (user) {
      form.reset({
        name: user.fullName || '',
        bio: (user as any)?.bio || '',
        linkedin: (user as any)?.linkedin || '',
        currentRole: (user as any)?.currentRole || '',
      })
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='border-0 bg-white shadow-none sm:max-w-2xl'>
        <DialogHeader className='pb-4 border-b border-gray-100'>
          <DialogTitle className='text-2xl font-bold text-gray-900'>
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6 pt-4'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-sm font-medium text-gray-700'>
                    Full Name <span className='text-red-500'>*</span>
                  </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Enter your full name'
                        className='h-10 w-full rounded-lg border-gray-300 bg-white px-3 py-2 text-sm transition-colors duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='text-xs text-red-600' />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='currentRole'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-sm font-medium text-gray-700'>
                      Current Role/Position
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g. Senior Software Engineer'
                        className='h-10 w-full rounded-lg border-gray-300 bg-white px-3 py-2 text-sm transition-colors duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='text-xs text-red-600' />
                  </FormItem>
                )}
              />

              <div className='col-span-1 md:col-span-2'>
                <FormField
                  control={form.control}
                  name='linkedin'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-sm font-medium text-gray-700'>
                        LinkedIn Profile URL
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='https://linkedin.com/in/username'
                          className='h-10 w-full rounded-lg border-gray-300 bg-white px-3 py-2 text-sm transition-colors duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className='text-xs text-red-600' />
                    </FormItem>
                  )}
                />
              </div>

              <div className='col-span-1 md:col-span-2'>
                <FormField
                  control={form.control}
                  name='bio'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-sm font-medium text-gray-700'>
                        Bio
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Tell us a little bit about yourself (optional)'
                          className='min-h-[100px] w-full resize-none rounded-lg border-gray-300 bg-white px-3 py-2 text-sm transition-colors duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200'
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage className='text-xs text-red-600' />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Profile Photo Upload */}
            <div className='rounded-lg border border-gray-100 bg-gray-50/50 p-4'>
              <div className='space-y-2'>
                <FormLabel className='text-sm font-medium text-gray-700'>
                  Profile Photo
                </FormLabel>
                <div className='mt-2'>
                   <ImageUpload
                    label='Upload profile photo'
                    handleImage={(imageId, imageURL) => {
                      setProfilePhotoId(imageId)
                      setProfilePhotoUrl(imageURL)
                    }}
                    initialImageId={profilePhotoId}
                    initialImageUrl={profilePhotoUrl}
                    inputId='edit-profile-photo-upload'
                  />
                </div>
              </div>
            </div>

            <div className='flex justify-end space-x-3 pt-6 border-t border-gray-100'>
              <Button
                type='button'
                variant='outline'
                onClick={handleCancel}
                className='h-10 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              >
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={form.formState.isSubmitting}
                className='h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50'
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Updating...
                  </>
                ) : (
                  'Update Profile'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
