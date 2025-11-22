import { Main } from '@/ui/layouts/main'
import { Card, CardContent } from '@/ui/shadcn/card'

function DashboardHomepage() {
  return (
    <Main>
      <div className='flex min-h-[60vh] items-center justify-center px-4'>
        <Card className='w-full max-w-4xl overflow-hidden border-0 shadow-xl'>
          <div className='relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-8 md:p-12 lg:p-16'>
            {/* Subtle overlay for depth */}
            <div className='absolute inset-0 bg-gradient-to-br from-white/10 to-transparent' />
            {/* Animated gradient overlay */}
            <div className='absolute inset-0 bg-gradient-to-tr from-blue-400/20 via-transparent to-green-400/20' />

            <CardContent className='relative z-10 p-0'>
              <h1 className='mb-4 text-3xl font-bold leading-tight text-white drop-shadow-lg md:text-4xl lg:text-5xl'>
                Welcome to Nepal Climate Hub Community
              </h1>
              <p className='text-base font-light text-white/95 md:text-lg'>
                We are updating the features soon. Stay tuned :)
              </p>
            </CardContent>
          </div>
        </Card>
      </div>
    </Main>
  )
}

export default DashboardHomepage
