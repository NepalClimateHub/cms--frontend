import { createFileRoute, useRouterState } from '@tanstack/react-router'
import AdminDashboardHomePage from '@/ui/pages/admin-dashboard'
import { useAuthStore } from '@/stores/authStore'
import { getRoleFromToken } from '@/utils/jwt.util'
import DashboardHomepage from '../../ui/pages/dashboard'

export const Route = createFileRoute('/_authenticated/')({
  component: () => {
    const { user } = useAuthStore()

    // Get role from router state (set during login navigation)
    const routerState = useRouterState({
      select: (s) => s.location.state as unknown as { role: 'ADMIN' | 'USER' },
    })

    // Use role from router state first, fallback to token if not available
    const role = routerState?.role || getRoleFromToken()

    // Check if user is admin: role is 'ADMIN' OR user is super admin
    const isAdmin = role === 'ADMIN' || user?.isSuperAdmin === true

    if (isAdmin) {
      return <AdminDashboardHomePage />
    } else if (role === 'USER') {
      return <DashboardHomepage />
    }

    // This should not happen due to beforeLoad, but handle gracefully
    return null
  },
})
