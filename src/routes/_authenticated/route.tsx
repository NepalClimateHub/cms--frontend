import { useEffect } from 'react'
import Cookies from 'js-cookie'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { useGetProfile } from '@/query/auth/use-auth'
import { User } from '@/schemas/auth/profile'
import { AppSidebar } from '@/ui/layouts/app-sidebar'
import { BoxLoader } from '@/ui/loader'
import { cn } from '@/ui/shadcn/lib/utils'
import { SidebarProvider } from '@/ui/shadcn/sidebar'
import TopHeader from '@/ui/top-header'
import { getAccessToken, useAuthStore } from '@/stores/authStore'

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
  const { accessToken, setUser, user: authUser } = useAuthStore()

  const { data: userData, isLoading: isLoadingProfile } =
    useGetProfile(!!accessToken)

  useEffect(() => {
    if (userData) {
      // Map UserOutput to User type
      const mappedUser: User = {
        id: userData.id,
        email: userData.email,
        fullName: userData.fullName,
        permissions: [], // Permissions not in UserOutput, will be empty
        isActive: userData.isAccountVerified,
        isSuperAdmin: userData.isSuperAdmin,
        organization: null, // Organization not in UserOutput
        profilePhotoUrl:
          (userData as { profilePhotoUrl?: string | null })?.profilePhotoUrl ||
          null,
        profilePhotoId:
          (userData as { profilePhotoId?: string | null })?.profilePhotoId ||
          null,
        linkedin: (userData as { linkedin?: string | null })?.linkedin || null,
        currentRole:
          (userData as { currentRole?: string | null })?.currentRole || null,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      }
      setUser(mappedUser)
    }
  }, [userData, setUser])

  // Show loader if profile is loading OR if user data doesn't match auth store user
  // This prevents showing the wrong menu when switching users
  // Wait until userData exists AND either:
  // 1. No authUser exists yet (first load), OR
  // 2. authUser matches userData (user is set correctly)
  const isUserDataReady = userData && (!authUser || authUser.id === userData.id)

  if (isLoadingProfile || !userData || !isUserDataReady) {
    return <BoxLoader />
  }

  return (
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
  )
}
