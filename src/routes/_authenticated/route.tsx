import Cookies from 'js-cookie'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { SearchProvider } from '@/context/search-context'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { getAccessToken, useAuthStore } from '@/stores/authStore'
import { useGetProfile } from '@/query/auth/use-auth'
import { useEffect } from 'react'
import { BoxLoader } from '@/components/loader'
import TopHeader from '@/components/top-header'

export const Route = createFileRoute('/_authenticated')({
  component: RouteComponent,
  beforeLoad: () => {
    const accessToken = getAccessToken()
    if (!accessToken) {
      redirect({
        to: '/login',
        throw: true,
      })
    }
  },
})

function RouteComponent() {
  const defaultOpen = Cookies.get('sidebar:state') !== 'false'
  const { accessToken, setUser } = useAuthStore()
  const { data: userData, isLoading: isLoadingProfile } = useGetProfile(!!accessToken)

  useEffect(() => {
    if (userData) {
      setUser(userData)
    }
  }, [userData])

  if (isLoadingProfile) {
    return (
      <BoxLoader />
    )
  }

  return (
    <SearchProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <div
          id='content'
          className={cn(
            'ml-auto w-full max-w-full',
            'peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)]',
            'peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]',
            'transition-[width] duration-200 ease-linear',
            'flex h-svh flex-col',
            'group-data-[scroll-locked=1]/body:h-full',
            'group-data-[scroll-locked=1]/body:has-[main.fixed-main]:h-svh'
          )}
        >
          <TopHeader />
          <Outlet />
        </div>
      </SidebarProvider>
    </SearchProvider>
  )
}
