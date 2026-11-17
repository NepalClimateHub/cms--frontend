import { Link, useNavigate } from '@tanstack/react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import apiClient from '@/query/apiClient'
import AuthLayout from '../auth-layout'
import { PasswordInput } from '@/ui/password-input'
import { Button } from '@/ui/shadcn/button'
import { Card } from '@/ui/shadcn/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/shadcn/form'

const formSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export default function ResetPassword() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const token = new URLSearchParams(window.location.search).get('token')
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (!token) return
    setError(null)
    setIsLoading(true)
    try {
      await apiClient.post('/api/v1/auth/reset-password', {
        token,
        newPassword: data.password,
      })
      navigate({ to: '/sign-in', replace: true })
    } catch {
      setError('This reset link is invalid or has expired. Request a new one.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <Card className='p-6'>
        <div className='mb-6 space-y-2'>
          <h1 className='text-md font-semibold tracking-tight'>Set a new password</h1>
          <p className='text-sm text-muted-foreground'>Choose a secure password with at least 8 characters.</p>
        </div>
        {!token ? (
          <p className='text-sm text-destructive' role='alert'>
            This reset link is incomplete. <Link to='/forgot-password' className='underline'>Request a new link</Link>.
          </p>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-4'>
              <FormField control={form.control} name='password' render={({ field }) => (
                <FormItem><FormLabel>New password</FormLabel><FormControl><PasswordInput autoComplete='new-password' {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name='confirmPassword' render={({ field }) => (
                <FormItem><FormLabel>Confirm new password</FormLabel><FormControl><PasswordInput autoComplete='new-password' {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              {error && <p className='text-sm text-destructive' role='alert'>{error}</p>}
              <Button disabled={isLoading}>{isLoading ? 'Resetting…' : 'Reset password'}</Button>
            </form>
          </Form>
        )}
      </Card>
    </AuthLayout>
  )
}
