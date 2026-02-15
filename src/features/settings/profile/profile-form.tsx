import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { Button } from '@/ui/shadcn/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/shadcn/form'
import { Input } from '@/ui/shadcn/input'

import { Textarea } from '@/ui/shadcn/textarea'
import { toast } from '@/hooks/use-toast'
import { useAuthStore } from '@/stores/authStore'
import { useUpdateProfile } from '@/query/users/use-users'
import { useEffect } from 'react'
import { BoxLoader } from '@/ui/loader'

const profileFormSchema = z.object({
  fullName: z
    .string()
    .min(2, {
      message: 'Name must be at least 2 characters.',
    })
    .max(50, {
      message: 'Name must not be longer than 50 characters.',
    }),
  email: z
    .string({
      required_error: 'Please select an email to display.',
    })
    .email(),
  bio: z.string().max(160).optional(),
  currentRole: z.string().max(100).optional(),
  linkedin: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export default function ProfileForm() {
  const { user } = useAuthStore()
  const { mutate: updateProfile, isPending } = useUpdateProfile()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      bio: '',
      currentRole: '',
      linkedin: '',
    },
    mode: 'onChange',
  })

  useEffect(() => {
    if (user) {
      form.reset({
        fullName: user.fullName || '',
        email: user.email || '',
        bio: user.bio || '',
        currentRole: user.currentRole || '',
        linkedin: user.linkedin || '',
      })
    }
  }, [user, form])

  function onSubmit(data: ProfileFormValues) {
    updateProfile(
      {
        body: {
          name: data.fullName,
          bio: data.bio || undefined,
          currentRole: data.currentRole || undefined,
          linkedin: data.linkedin || undefined,
        },
      },
      {
        onSuccess: () => {
          toast({
            title: 'Profile updated',
            description: 'Your profile has been updated successfully.',
          })
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: (error as any).error?.message || 'Failed to update profile.',
            variant: 'destructive',
          })
        },
      }
    )
  }

  if (!user) {
    return <BoxLoader />
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <FormField
          control={form.control}
          name='fullName'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder='Your Name' {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
               <FormControl>
                <Input placeholder='Email' {...field} disabled />
              </FormControl>
              <FormDescription>
                You can manage verified email addresses in your{' '}
                <Link to='/settings/account'>email settings</Link>.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name='currentRole'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Role/Position</FormLabel>
              <FormControl>
                <Input placeholder='e.g. Senior Software Engineer' {...field} />
              </FormControl>
              <FormDescription>
                Your current professional role. (Optional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name='linkedin'
          render={({ field }) => (
            <FormItem>
              <FormLabel>LinkedIn Profile URL</FormLabel>
              <FormControl>
                <Input placeholder='https://linkedin.com/in/username' {...field} />
              </FormControl>
              <FormDescription>
                Link to your LinkedIn profile. (Optional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='bio'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Tell us a little bit about yourself'
                  className='resize-none'
                  {...field}
                />
              </FormControl>
              <FormDescription>
                You can <span>@mention</span> other users and organizations to
                link to them.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit' disabled={isPending}>
          {isPending ? 'Updating...' : 'Update profile'}
        </Button>
      </form>
    </Form>
  )
}
