import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { Alert, AlertTitle, AlertDescription } from '@/ui/shadcn/alert'
import { Button } from '@/ui/shadcn/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/ui/shadcn/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/shadcn/form'
import { Input } from '@/ui/shadcn/input'
import { Loader2 } from 'lucide-react'

const otpSchema = z.object({
  otp: z
    .string()
    .min(6, 'OTP must be at least 6 characters')
    .max(6, 'OTP must be 6 characters'),
})

type OtpForm = z.infer<typeof otpSchema>

export default function OtpVerification() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/(auth)/otp-verification' })
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  const form = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  })

  const onSubmit = async (data: OtpForm) => {
    try {
      // TODO: Implement OTP verification API call
      console.log('Verifying OTP:', data.otp)
      // On success, redirect to login
      navigate({ to: '/sign-in', replace: true })
    } catch (error) {
      console.error('OTP verification failed:', error)
    }
  }

  const handleResendOtp = async () => {
    setIsResending(true)
    try {
      // TODO: Implement resend OTP API call
      console.log('Resending OTP to:', search.email)
      setResendSuccess(true)
      setTimeout(() => setResendSuccess(false), 3000)
    } catch (error) {
      console.error('Resend OTP failed:', error)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-background px-4 py-6 sm:px-6 lg:px-8'>
      <Card className='w-full max-w-md border-0 bg-white shadow-none'>
        <CardHeader className='pb-2'>
          <CardTitle className='text-2xl font-bold text-gray-900 sm:text-3xl'>
            Verify Your Email
          </CardTitle>
          <CardDescription className='text-sm sm:text-base'>
            Enter the 6-digit code sent to {search.email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {resendSuccess && (
            <Alert className='mb-4 border-green-200 bg-green-50'>
              <AlertTitle className='text-green-800'>OTP Sent!</AlertTitle>
              <AlertDescription className='text-green-700'>
                A new verification code has been sent to your email.
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <FormField
                control={form.control}
                name='otp'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='Enter 6-digit code'
                        maxLength={6}
                        className='text-center font-mono text-lg tracking-widest'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type='submit'
                className='h-10 w-full rounded-lg bg-blue-600 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-700 sm:h-11 sm:text-base'
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting && (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                )}
                Verify Email
              </Button>
            </form>
          </Form>

          <div className='mt-6 text-center'>
            <p className='text-sm text-gray-600'>
              Didn't receive the code?{' '}
              <Button
                variant='link'
                className='p-0 text-blue-600 underline underline-offset-4 transition-colors hover:text-blue-700'
                onClick={handleResendOtp}
                disabled={isResending}
              >
                {isResending ? 'Sending...' : 'Resend Code'}
              </Button>
            </p>
          </div>

          <div className='mt-6 text-center'>
            <span className='text-sm text-gray-600'>
              Back to{' '}
              <Link
                to='/sign-in'
                className='font-medium text-blue-600 underline underline-offset-4 transition-colors hover:text-blue-700'
              >
                Sign In
              </Link>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
