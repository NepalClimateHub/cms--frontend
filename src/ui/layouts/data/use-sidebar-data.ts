import { useAuthStore } from '@/stores/authStore'
import { SidebarData } from '../types'
import { generalSidebarData, superAdminSidebarData } from './sidebar-data'
import { getRoleFromToken } from '@/utils/jwt.util'

export const useSideBarData = (): SidebarData => {
  const { user } = useAuthStore()

  console.log('user', user)
  const role = getRoleFromToken()
  const isAdmin = role === 'ADMIN' || user?.isSuperAdmin === true

  if (!isAdmin) {
    return {
      navGroups: generalSidebarData,
    }
  }

  return {
    navGroups: [...superAdminSidebarData],
  }
}
