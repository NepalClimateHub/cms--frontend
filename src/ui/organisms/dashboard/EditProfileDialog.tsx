import { useEffect } from 'react'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import apiClient from '@/query/apiClient'
import { useGetProfile } from '@/query/auth/use-auth'
import type { UserSocials } from '@/schemas/auth/profile'
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
import {
  mapUserOutputToAuthUser,
  nullableString,
} from '@/utils/map-user-output'
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
  facebook: z
    .string()
    .url({ message: 'Please enter a valid URL.' })
    .optional()
    .or(z.literal('')),
  instagram: z
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

  const form = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: profileData?.fullName || user?.fullName || '',
      bio: nullableString(profileData?.bio) ?? nullableString(user?.bio) ?? '',
      linkedin:
        (profileData?.socials as UserSocials)?.linkedin ||
        (user?.socials as UserSocials)?.linkedin ||
        '',
      facebook:
        (profileData?.socials as UserSocials)?.facebook ||
        (user?.socials as UserSocials)?.facebook ||
        '',
      instagram:
        (profileData?.socials as UserSocials)?.instagram ||
        (user?.socials as UserSocials)?.instagram ||
        '',
      currentRole:
        nullableString(profileData?.currentRole) ??
        nullableString(user?.currentRole) ??
        '',
    },
  })

  // Reset form when dialog opens or profile data changes
  useEffect(() => {
    if (open && profileData) {
      form.reset({
        name: profileData.fullName || '',
        bio: nullableString(profileData.bio) ?? '',
        linkedin: (profileData.socials as UserSocials)?.linkedin || '',
        facebook: (profileData.socials as UserSocials)?.facebook || '',
        instagram: (profileData.socials as UserSocials)?.instagram || '',
        currentRole: nullableString(profileData.currentRole) ?? '',
      })
    } else if (open && user) {
      form.reset({
        name: user.fullName || '',
        bio: user.bio ?? '',
        linkedin: (user.socials as UserSocials)?.linkedin || '',
        facebook: (user.socials as UserSocials)?.facebook || '',
        instagram: (user.socials as UserSocials)?.instagram || '',
        currentRole: user.currentRole ?? '',
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
      const updatePayload: Record<string, unknown> = {
        fullName: data.name,
        bio: data.bio || undefined,
        currentRole: data.currentRole || undefined,
        socials: {
          ...((profileData?.socials as UserSocials) || {}),
          linkedin: data.linkedin || undefined,
          facebook: data.facebook || undefined,
          instagram: data.instagram || undefined,
        },
      }

      // Use PATCH /me endpoint to update current user's profile
      await apiClient.patch('/api/v1/users/me', updatePayload)
      // Refetch profile to get updated user data
      const profileRes = await refetchProfile()
      if (profileRes.data) {
        setUser(
          mapUserOutputToAuthUser(profileRes.data, user?.organization ?? null)
        )
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
        bio: String(
          (profileData as unknown as Record<string, unknown>)?.bio || ''
        ),
        linkedin: String(
          (profileData as unknown as Record<string, unknown>)?.linkedin || ''
        ),
        currentRole: String(
          (profileData as unknown as Record<string, unknown>)?.currentRole || ''
        ),
      })
    } else if (user) {
      form.reset({
        name: user.fullName || '',
        bio: String((user as unknown as Record<string, unknown>)?.bio || ''),
        linkedin: String(
          (user as unknown as Record<string, unknown>)?.linkedin || ''
        ),
        currentRole: String(
          (user as unknown as Record<string, unknown>)?.currentRole || ''
        ),
      })
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[80vh] flex-col overflow-hidden border-0 bg-white shadow-none sm:max-w-2xl'>
        <DialogHeader className='shrink-0 border-b border-gray-100 pb-4'>
          <DialogTitle className='text-2xl font-bold text-gray-900'>
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex flex-1 flex-col overflow-hidden'
          >
            <div className='-mr-4 flex-1 overflow-y-auto py-4 pr-4'>
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

              {/* Social Links */}
              <div className='mt-6 grid grid-cols-1 gap-6 md:grid-cols-2'>
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

                <FormField
                  control={form.control}
                  name='facebook'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-sm font-medium text-gray-700'>
                        Facebook Profile URL
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='https://facebook.com/username'
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
                  name='instagram'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-sm font-medium text-gray-700'>
                        Instagram Profile URL
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='https://instagram.com/username'
                          className='h-10 w-full rounded-lg border-gray-300 bg-white px-3 py-2 text-sm transition-colors duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className='text-xs text-red-600' />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className='flex shrink-0 justify-end space-x-3 border-t border-gray-100 bg-white pt-6'>
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
