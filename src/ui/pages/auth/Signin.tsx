import { HTMLAttributes, useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { useLogin } from '@/query/auth/use-auth'
import { LoginPayload, loginSchema } from '@/schemas/auth/login'
import { PasswordInput } from '@/ui/password-input'
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
import { cn } from '@/ui/shadcn/lib/utils'
import { Loader2 } from 'lucide-react'

// Minimal, modern login form
function UserAuthForm({ className }: HTMLAttributes<HTMLDivElement>) {
  const { mutate: mutateLogin, isPending, error } = useLogin()
  const navigate = useNavigate()
  const form = useForm<LoginPayload>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  function onSubmit(payload: LoginPayload) {
    mutateLogin({ body: { ...payload } })
  }

  function handleVerifyAccount() {
    navigate({
      to: '/verify-email',
      search: { email: form.watch('email') },
    })
  }

  // Check if it's an unverified account error
  const isUnverifiedAccount =
    error &&
    typeof error === 'object' &&
    'error' in error &&
    (error as unknown as { error?: { message?: string } }).error?.message ===
      'This account is not verified!'

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('space-y-3', className)}
      >
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type='email'
                  autoComplete='email'
                  className='rounded-lg border-gray-300 transition-colors duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <div className='flex items-center justify-between'>
                <FormLabel>Password</FormLabel>
                <Link
                  to='/forgot-password'
                  className='text-sm font-medium text-muted-foreground hover:opacity-75'
                >
                  Forgot password?
                </Link>
              </div>
              <FormControl>
                <PasswordInput
                  autoComplete='current-password'
                  className='rounded-lg border-gray-300 transition-colors duration-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          className='h-10 w-full rounded-lg bg-blue-600 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-700 sm:h-11 sm:text-base'
          disabled={isPending}
        >
          {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          Login
        </Button>

        {(isUnverifiedAccount as any) && (
          <div className='mt-3 text-center'>
            <p className='mb-2 text-sm text-red-600'>
              Your account is not verified. Please check your email for
              verification instructions.
            </p>
            <Button
              type='button'
              variant='link'
              onClick={handleVerifyAccount}
              className='p-0 text-blue-600 underline underline-offset-4 hover:text-blue-700'
            >
              Verify Account
            </Button>
          </div>
        )}
      </form>
    </Form>
  )
}

export default function SignIn() {
  const features = [
    'Create your Climate Profile',
    'Stay updated with Climate News',
    'Connect with Climate Enthusiasts',
    'Access Climate Opportunities',
    'Participate in Climate Events',
  ]

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false)
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % features.length)
        setIsVisible(true)
      }, 300) // Wait for fade out animation
    }, 3000) // Change every 3 seconds

    return () => clearInterval(interval)
  }, [features.length])

  return (
    <div className='flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:px-8'>
      <div className='flex w-full max-w-7xl overflow-hidden rounded-xl border-2 border-gray-200 bg-background shadow-xl'>
        {/* Main Section - Branding & Features with Login Form */}
        <div
          className='relative flex min-h-[600px] w-full flex-col justify-between bg-cover bg-center bg-no-repeat p-4 sm:p-6 lg:flex lg:min-h-[700px]'
          style={{ backgroundImage: "url('images/mountain.png')" }}
        >
          <div className='absolute inset-0 bg-gradient-to-br from-blue-900/90 via-blue-800/85 to-blue-700/80' />

          {/* Top Section - Logo and Branding */}
          <div className='relative z-10 flex flex-col items-start space-y-3'>
            <div className='flex items-center'>
              <img
                src='images/logo.png'
                alt='Nepal Climate Hub'
                className='mr-3 h-8 w-8 sm:h-10 sm:w-10'
              />
              <span className='text-xl font-bold text-white sm:text-2xl'>
                Nepal Climate Hub
              </span>
            </div>
            <div className='ml-[2.75rem] min-h-[32px] sm:ml-[3.5rem]'>
              <div
                className={cn(
                  'flex items-center space-x-2 transition-all duration-300',
                  isVisible
                    ? 'translate-y-0 opacity-100'
                    : '-translate-y-2 opacity-0'
                )}
              >
                <div className='h-1.5 w-1.5 animate-pulse rounded-full bg-blue-300' />
                <p className='text-xs font-medium text-blue-100 sm:text-sm'>
                  {features[currentIndex]}
                </p>
              </div>
            </div>
          </div>

          {/* Center Section - Login Form */}
          <div className='relative z-10 mt-5 flex flex-1 flex-col items-center justify-center'>
            <Card className='w-full max-w-md flex-col border border-gray-200 bg-white p-4 shadow-lg sm:p-5'>
              <CardHeader className='mb-3 text-center'>
                <CardTitle className='text-xl font-bold tracking-tight text-gray-900 sm:text-2xl'>
                  NCH Login
                </CardTitle>
                <CardDescription className='text-xs sm:text-sm'>
                  Sign in to your account
                </CardDescription>
              </CardHeader>
              <CardContent className='flex flex-1 flex-col space-y-3'>
                <div className='flex-1'>
                  <UserAuthForm />
                  <div className='mt-3 text-center'>
                    <p className='text-xs leading-relaxed text-gray-500'>
                      By signing in, you agree to our{' '}
                      <a
                        href='/terms'
                        className='font-medium text-blue-600 transition-colors hover:text-blue-700'
                      >
                        Terms
                      </a>{' '}
                      and{' '}
                      <a
                        href='/privacy'
                        className='font-medium text-blue-600 transition-colors hover:text-blue-700'
                      >
                        Privacy
                      </a>
                    </p>
                  </div>
                </div>
                <hr />
                <div className='mt-auto text-center'>
                  <span className='text-sm text-gray-600'>
                    Don't have an account?{' '}
                    <Link
                      to='/sign-up'
                      className='font-medium text-blue-600 underline underline-offset-4 transition-colors hover:text-blue-700'
                    >
                      Sign Up
                    </Link>
                  </span>
                </div>
              </CardContent>
            </Card>
            {/* Community Text Below Login */}
            <p className='mt-6 max-w-md text-center text-xs leading-relaxed text-blue-100 sm:text-sm'>
              Join our community of climate enthusiasts and make a difference in
              Nepal's environmental future.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
