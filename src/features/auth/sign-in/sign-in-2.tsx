import { UserAuthForm } from './components/user-auth-form'

export default function SignIn2() {
  return (
    <div className='container relative grid h-svh flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <div
        className='relative hidden h-full flex-col bg-cover bg-center bg-no-repeat p-16 text-white dark:border-r lg:flex'
        style={{
          backgroundImage: "url('/src/assets/images/mountain.png')",
        }}
      >
        <div className='absolute inset-0 bg-gradient-to-br from-blue-900/80 to-blue-800/80' />
        <div className='relative z-20 flex items-center text-2xl font-bold'>
          <img
            src='/src/assets/images/logo.png'
            alt='Nepal Climate Hub'
            className='mr-4 h-12 w-12'
          />
          <span className='text-3xl font-bold'>Nepal Climate Hub</span>
        </div>

        <div className='relative z-20 mt-auto'>
          <div className='space-y-4'>
            <h2 className='text-4xl font-bold'>Welcome to Nepal Climate Hub</h2>
            <p className='text-lg'>
              Join our community of climate enthusiasts and make a difference in
              Nepal's environmental future
            </p>
            <div className='mt-8 space-y-4'>
              <div className='flex items-center space-x-4'>
                <div className='h-1 w-12 rounded-full bg-white/20' />
                <p className='text-sm'>Stay updated with Climate News</p>
              </div>
              <div className='flex items-center space-x-4'>
                <div className='h-1 w-12 rounded-full bg-white/20' />
                <p className='text-sm'>Connect with Climate Enthusiasts</p>
              </div>
              <div className='flex items-center space-x-4'>
                <div className='h-1 w-12 rounded-full bg-white/20' />
                <p className='text-sm'>And many more.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='lg:p-16'>
        <div className='card flex w-full flex-col justify-center space-y-6 bg-white/5 p-20 shadow-lg backdrop-blur-sm'>
          <div className='flex flex-col space-y-4 text-center'>
            <h1 className='text-3xl font-bold tracking-tight text-blue-900'>
              Login
            </h1>
          </div>
          <UserAuthForm />

          <p className='text-sm text-blue-600'>
            By clicking continue, you agree to our{' '}
            <a
              href='/terms'
              className='font-medium underline underline-offset-4 hover:text-blue-800'
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href='/privacy'
              className='font-medium underline underline-offset-4 hover:text-blue-800'
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
