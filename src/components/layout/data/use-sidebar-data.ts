import { useAuthStore } from '@/stores/authStore'
import { SidebarData } from '../types'
import { generalSidebarData, superAdminSidebarData } from './sidebar-data'

export const useSideBarData = (): SidebarData => {
  const { user } = useAuthStore()
  if (!user?.isSuperAdmin) {
    return {
      navGroups: generalSidebarData,
    }
  }
  return {
    navGroups: [...superAdminSidebarData, ...generalSidebarData],
  }
}
