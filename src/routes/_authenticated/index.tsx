import { createFileRoute, useRouterState } from '@tanstack/react-router'
import AdminDashboardHomePage from '@/ui/pages/admin-dashboard'
import IndividualDashboardHome from '@/ui/pages/dashboard/individual-dashboard-home'
import OrganizationDashboardHome from '@/ui/pages/dashboard/organization-dashboard-home'
import { useAuthStore } from '@/stores/authStore'
import { getRoleFromToken } from '@/utils/jwt.util'
import DashboardHomepage from '../../ui/pages/dashboard'

function AuthenticatedIndex() {
  const { user } = useAuthStore()

  const routerState = useRouterState({
    select: (s) => s.location.state as unknown as { role: string },
  })

  const role = routerState?.role || getRoleFromToken()

  const isAdminLevel =
    role === 'SUPER_ADMIN' ||
    role === 'ADMIN' ||
    role === 'CONTENT_ADMIN' ||
    user?.isSuperAdmin === true

  if (isAdminLevel) {
    return <AdminDashboardHomePage />
  }
  if (role === 'ORGANIZATION') {
    return <OrganizationDashboardHome />
  }
  if (role === 'INDIVIDUAL') {
    return <IndividualDashboardHome />
  }
  return <DashboardHomepage />
}

export const Route = createFileRoute('/_authenticated/')({
  component: AuthenticatedIndex,
})
