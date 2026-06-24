import { Link } from '@tanstack/react-router'
import { useGetProfile } from '@/query/auth/use-auth'
import { Main } from '@/ui/layouts/main'
import { Button } from '@/ui/shadcn/button'
import { Card, CardContent } from '@/ui/shadcn/card'
import {
  BookOpen,
  Building2,
  MessageCircle,
  UserCircle,
  ShieldCheck,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { getProfileCompletion } from '@/utils/profile-completion'

export default function OrganizationDashboardHome() {
  const { user: authUser } = useAuthStore()
  const { data: profileData } = useGetProfile()
  const user = profileData || authUser
  const completion = getProfileCompletion(user)
  const isComplete = completion === 100

  return (
    <Main isHome>
      <div className='flex min-h-[60vh] flex-col items-center gap-6 px-4 py-8'>
        <Card className='w-full max-w-4xl overflow-hidden border-0 shadow-xl'>
          <div className='relative bg-gradient-to-br from-slate-700 via-teal-700 to-emerald-800 p-8 md:p-12 lg:p-16'>
            <div className='absolute inset-0 bg-gradient-to-br from-white/10 to-transparent' />
            <div className='absolute inset-0 bg-gradient-to-tr from-amber-400/15 via-transparent to-teal-400/20' />

            <CardContent className='relative z-10 space-y-6 p-0'>
              <div>
                <p className='mb-2 flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-white/80'>
                  <Building2 className='h-4 w-4' />
                  Organization account
                </p>
                <h1 className='mb-4 text-3xl font-bold leading-tight text-white drop-shadow-lg md:text-4xl lg:text-5xl'>
                  {isComplete
                    ? 'Your organization dashboard'
                    : `Your profile is ${completion}% completed`}
                </h1>
                <p className='max-w-2xl text-base font-light text-white/95 md:text-lg'>
                  {isComplete ? (
                    'Keep your public profile and verification details up to date, publish blogs, and connect with the hub as your organization.'
                  ) : (
                    <Link
                      to='/dashboard/profile'
                      search={{ highlightEdit: true }}
                      className='flex items-center gap-2 font-medium text-white underline underline-offset-4 hover:text-white/80'
                    >
                      <ShieldCheck className='h-5 w-5' />
                      Complete your organization profile now to get verified and
                      start contributing.
                    </Link>
                  )}
                </p>
              </div>
              <div className='flex flex-wrap gap-3'>
                <Button
                  asChild
                  size='lg'
                  className='bg-white/95 text-teal-900 shadow-md hover:bg-white'
                >
                  <Link
                    to='/dashboard/profile'
                    search={{ highlightEdit: true }}
                    className='gap-2'
                  >
                    <UserCircle className='h-4 w-4' />
                    Edit profile
                  </Link>
                </Button>
                <Button
                  asChild
                  size='lg'
                  variant='secondary'
                  className='border border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20'
                >
                  <Link to='/blog/list' className='gap-2'>
                    <BookOpen className='h-4 w-4' />
                    Blogs
                  </Link>
                </Button>
                <Button
                  asChild
                  size='lg'
                  variant='secondary'
                  className='border border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20'
                >
                  <Link to='/ask-ai' className='gap-2'>
                    <MessageCircle className='h-4 w-4' />
                    Ask AI
                  </Link>
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>
    </Main>
  )
}
