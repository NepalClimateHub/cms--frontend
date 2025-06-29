import { HTMLAttributes } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { useLogin } from '@/query/auth/use-auth'
import { LoginPayload, loginSchema } from '@/schemas/auth/login'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'

type UserAuthFormProps = HTMLAttributes<HTMLDivElement>

function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const { mutate: mutateLogin, isPending } = useLogin()

  const form = useForm<LoginPayload>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  function onSubmit(payload: LoginPayload) {
    mutateLogin({
      body: {
        ...payload,
      },
    })
  }

  return (
    <div className={cn('grid gap-10', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className='grid gap-6'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type='email'
                      placeholder='name@example.com'
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
                <FormItem className='space-y-1'>
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
                    <PasswordInput placeholder='********' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className='mt-2' disabled={isPending}>
              {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Login
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default function SignIn2() {
  return (
    <div className='grid min-h-screen lg:grid-cols-2'>
      {/* Left Side - Background Image */}
      <div
        className='relative hidden h-full min-h-screen flex-col justify-between bg-cover bg-center bg-no-repeat p-12 lg:flex'
        style={{
          backgroundImage: "url('/images/mountain.png')",
        }}
      >
        {/* Overlay */}
        <div className='absolute inset-0 bg-gradient-to-br from-blue-900/90 via-blue-800/85 to-blue-700/80' />

        {/* Logo */}
        <div className='relative z-10 flex items-center'>
          <img
            src='/images/logo.png'
            alt='Nepal Climate Hub'
            className='mr-3 h-10 w-10'
          />
          <span className='text-2xl font-bold text-white'>
            Nepal Climate Hub
          </span>
        </div>

        {/* Content */}
        <div className='relative z-10 max-w-md'>
          <div className='space-y-6'>
            <div>
              <h1 className='text-4xl font-bold leading-tight text-white'>
                Welcome to Nepal Climate Hub
              </h1>
              <p className='mt-4 text-lg leading-relaxed text-blue-100'>
                Join our community of climate enthusiasts and make a difference
                in Nepal's environmental future
              </p>
            </div>

            {/* Features */}
            <div className='space-y-4 pt-4'>
              <div className='flex items-center space-x-3'>
                <div className='h-2 w-2 rounded-full bg-blue-300' />
                <p className='font-medium text-blue-100'>
                  Stay updated with Climate News
                </p>
              </div>
              <div className='flex items-center space-x-3'>
                <div className='h-2 w-2 rounded-full bg-blue-300' />
                <p className='font-medium text-blue-100'>
                  Connect with Climate Enthusiasts
                </p>
              </div>
              <div className='flex items-center space-x-3'>
                <div className='h-2 w-2 rounded-full bg-blue-300' />
                <p className='font-medium text-blue-100'>
                  Access Climate Opportunities
                </p>
              </div>
              <div className='flex items-center space-x-3'>
                <div className='h-2 w-2 rounded-full bg-blue-300' />
                <p className='font-medium text-blue-100'>
                  Participate in Climate Events
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className='flex min-h-screen items-center justify-center p-6 lg:p-12'>
        <div className='w-full max-w-md space-y-8'>
          {/* Mobile Logo */}
          <div className='mb-8 flex items-center justify-center lg:hidden'>
            <img
              src='/images/logo.png'
              alt='Nepal Climate Hub'
              className='mr-2 h-8 w-8'
            />
            <span className='text-xl font-bold text-gray-900'>
              Nepal Climate Hub
            </span>
          </div>

          {/* Form Container */}
          <div className='space-y-6'>
            <div className='space-y-2 text-center'>
              <h1 className='text-3xl font-bold tracking-tight text-gray-900'>
                Welcome back
              </h1>
              <p className='text-gray-600'>
                Sign in to your account to continue
              </p>
            </div>

            <UserAuthForm />

            {/* Terms */}
            <div className='text-center'>
              <p className='text-xs leading-relaxed text-gray-500'>
                By signing in, you agree to our{' '}
                <a
                  href='/terms'
                  className='font-medium text-blue-600 transition-colors hover:text-blue-700'
                >
                  Terms of Service
                </a>{' '}
                and{' '}
                <a
                  href='/privacy'
                  className='font-medium text-blue-600 transition-colors hover:text-blue-700'
                >
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
