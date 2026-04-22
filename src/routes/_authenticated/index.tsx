import { createFileRoute, useRouterState } from '@tanstack/react-router'
import AdminDashboardHomePage from '@/ui/pages/admin-dashboard'
import IndividualDashboardHome from '@/ui/pages/dashboard/individual-dashboard-home'
import OrganizationDashboardHome from '@/ui/pages/dashboard/organization-dashboard-home'
import { useAuthStore } from '@/stores/authStore'
import { getRoleFromToken } from '@/utils/jwt.util'
import DashboardHomepage from '../../ui/pages/dashboard'

export const Route = createFileRoute('/_authenticated/')({
  component: () => {
    const { user } = useAuthStore()

    // Get role from router state (set during login navigation)
    const routerState = useRouterState({
      select: (s) => s.location.state as unknown as { role: string },
    })

    // Use role from router state first, fallback to token if not available
    const role = routerState?.role || getRoleFromToken()

    // Check if user is admin-level: SUPER_ADMIN, ADMIN, CONTENT_ADMIN or legacy super admin flag
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
  },
})
