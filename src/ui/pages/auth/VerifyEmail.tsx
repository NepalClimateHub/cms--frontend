import { useState } from 'react'
import { Link, useSearch } from '@tanstack/react-router'
import { Alert, AlertTitle, AlertDescription } from '@/ui/shadcn/alert'
import { Button } from '@/ui/shadcn/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/ui/shadcn/card'
import { Loader2, Mail, CheckCircle } from 'lucide-react'
import { useResendVerification } from '@/query/auth/use-auth'

export default function VerifyEmail() {
  const search = useSearch({ from: '/(auth)/verify-email' })
  const [resendSuccess, setResendSuccess] = useState(false)
  const resendVerificationMutation = useResendVerification()

  const handleResendOtp = async () => {
    if (!search.email) {
      console.error('No email provided')
      return
    }

    try {
      await resendVerificationMutation.mutateAsync({ body: { email: search.email } })
      setResendSuccess(true)
      setTimeout(() => setResendSuccess(false), 5000) // Show success for 5 seconds
    } catch (error) {
      console.error('Resend verification failed:', error)
      // Error is already handled by the mutation's onError
    }
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-background px-4 py-6 sm:px-6 lg:px-8'>
      <Card className='w-full max-w-md border-0 bg-white shadow-none'>
        <CardHeader className='pb-2 text-center'>
          <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100'>
            <Mail className='h-8 w-8 text-green-600' />
          </div>
          <CardTitle className='text-2xl font-bold text-gray-900 sm:text-3xl'>
            Verification Sent!
          </CardTitle>
          <CardDescription className='text-sm sm:text-base'>
            Please check your email for the verification link
          </CardDescription>
        </CardHeader>
        <CardContent>
          {resendSuccess && (
            <Alert className='mb-4 border-green-200 bg-green-50'>
              <CheckCircle className='h-4 w-4 text-green-600' />
              <AlertTitle className='text-green-800'>Verification Email Sent!</AlertTitle>
              <AlertDescription className='text-green-700'>
                A new verification email has been sent to {search.email}. Please check your inbox and spam folder.
              </AlertDescription>
            </Alert>
          )}

          <div className='space-y-6'>
            <div className='text-center'>
              <p className='text-sm text-gray-600'>
                We've sent a verification email to:
              </p>
              <p className='mt-1 font-medium text-gray-900'>{search.email}</p>
            </div>

            <div className='space-y-4'>
              <Button
                onClick={handleResendOtp}
                disabled={resendVerificationMutation.isPending}
                className='h-10 w-full rounded-lg bg-blue-600 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-700 sm:h-11 sm:text-base'
              >
                {resendVerificationMutation.isPending ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Sending...
                  </>
                ) : (
                  'Resend Verification Email'
                )}
              </Button>

              <div className='text-center'>
                <p className='text-sm text-gray-600'>
                  Didn't receive the email? Check your spam folder or{' '}
                  <Button
                    variant='link'
                    className='p-0 text-blue-600 underline underline-offset-4 transition-colors hover:text-blue-700'
                    onClick={handleResendOtp}
                    disabled={resendVerificationMutation.isPending}
                  >
                    try again
                  </Button>
                </p>
              </div>
            </div>

            <div className='text-center'>
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
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
