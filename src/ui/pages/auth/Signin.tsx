import { HTMLAttributes } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { useLogin } from '@/query/auth/use-auth'
import { LoginPayload, loginSchema } from '@/schemas/auth/login'
import { PasswordInput } from '@/ui/password-input'
import { Button } from '@/ui/shadcn/button'
import { Card, CardContent } from '@/ui/shadcn/card'
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

        {Boolean(isUnverifiedAccount) && (
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
  return (
    <div className='flex min-h-screen bg-background'>
      {/* Left Pane - Branding (Desktop Only) */}
      <div className='relative hidden w-1/2 flex-col justify-between bg-zinc-900 p-10 text-white lg:flex'>
        <div
          className='absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50 brightness-75 transition-opacity'
          style={{ backgroundImage: 'url("/signup-bg.png")' }}
        />
        <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent' />

        <div className='relative z-20 flex items-center text-lg font-medium'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='mr-2 h-6 w-6'
          >
            <path d='M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3' />
          </svg>
          Nepal Climate Hub
        </div>

        <div className='relative z-20 mt-auto'>
          <blockquote className='space-y-2'>
            <p className='text-lg'>
              &ldquo;Welcome back to Nepal Climate Hub. Log in to continue
              your journey and connect with the climate community.&rdquo;
            </p>
            <footer className='text-sm italic'>
              Uniting for Climate Action
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className='flex w-full items-center justify-center p-4 lg:w-1/2 lg:p-8 overflow-y-auto'>
        <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]'>
          <div className='flex flex-col space-y-2 text-center animate-in fade-in slide-in-from-top-4 duration-500'>
            <h1 className='text-3xl font-semibold tracking-tight'>
              Sign in to NCH
            </h1>
            <p className='text-sm text-muted-foreground'>
              Enter your email and password to access your account
            </p>
          </div>

          <Card className='border-none bg-transparent shadow-none'>
            <CardContent className='p-0'>
              <div className='grid gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500'>
                <UserAuthForm />
              </div>

              {/* Footer */}
              <div className='mt-8 flex flex-col items-center space-y-4 text-center'>
                <p className='text-sm text-muted-foreground'>
                  Don't have an account?{' '}
                  <Link
                    to='/sign-up'
                    className='font-semibold text-primary underline-offset-4 transition-colors hover:underline'
                  >
                    Sign Up
                  </Link>
                </p>
                <div className='max-w-[340px] text-xs leading-normal text-muted-foreground'>
                  By signing in, you agree to our{' '}
                  <a
                    href='/terms'
                    className='underline underline-offset-4 transition-colors hover:text-primary'
                  >
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a
                    href='/privacy'
                    className='underline underline-offset-4 transition-colors hover:text-primary'
                  >
                    Privacy Policy
                  </a>
                  .
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
