import { zodResolver } from '@hookform/resolvers/zod'
import { type HTMLAttributes, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import apiClient from '@/query/apiClient'
import { Button } from '@/ui/shadcn/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/shadcn/form'
import { Input } from '@/ui/shadcn/input'
import { cn } from '@/ui/shadcn/lib/utils'

type ForgotFormProps = HTMLAttributes<HTMLDivElement>

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Please enter your email' })
    .email({ message: 'Invalid email address' }),
})

export function ForgotForm({ className, ...props }: ForgotFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '' },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setError(null)
    try {
      await apiClient.post('/api/v1/auth/forgot-password', data)
      setSent(true)
    } catch {
      setError('We could not send the reset email. Please try again shortly.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className='grid gap-2'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder='name@example.com' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className='mt-2' disabled={isLoading || sent}>
              {isLoading ? 'Sending…' : sent ? 'Email sent' : 'Send reset link'}
            </Button>
            {sent && (
              <p className='text-sm text-green-700' role='status'>
                If an account uses this email, a reset link is on its way.
              </p>
            )}
            {error && <p className='text-sm text-destructive' role='alert'>{error}</p>}
          </div>
        </form>
      </Form>
    </div>
  )
}
