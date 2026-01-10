import { useEffect } from 'react'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import apiClient from '@/query/apiClient'
import { useGetProfile } from '@/query/auth/use-auth'
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

  const form = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: profileData?.fullName || user?.fullName || '',
      bio: (profileData as any)?.bio || (user as any)?.bio || '',
    },
  })

  // Reset form when dialog opens or profile data changes
  useEffect(() => {
    if (open && profileData) {
      form.reset({
        name: profileData.fullName || '',
        bio: (profileData as any)?.bio || '',
      })
    } else if (open && user) {
      form.reset({
        name: user.fullName || '',
        bio: (user as any)?.bio || '',
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
      // Use PATCH /me endpoint to update current user's profile
      await apiClient.patch('/api/v1/users/me', {
        name: data.name,
        bio: data.bio || undefined,
      })
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
      })
    } else if (user) {
      form.reset({
        name: user.fullName || '',
        bio: (user as any)?.bio || '',
      })
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='border-0 bg-white shadow-none sm:max-w-[425px]'>
        <DialogHeader className='pb-2 text-center'>
          <DialogTitle className='text-2xl font-bold text-gray-900 sm:text-3xl'>
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-medium text-gray-700'>
                    Full Name
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

            <div className='flex justify-end space-x-3 pt-6'>
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
