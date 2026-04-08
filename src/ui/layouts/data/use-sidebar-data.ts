import { getRoleFromToken } from '@/utils/jwt.util'
import { SidebarData } from '../types'
import { generalSidebarData, superAdminSidebarData } from './sidebar-data'

export const useSideBarData = (): SidebarData => {

  const role = getRoleFromToken()
  const isAdminLevel =
    role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'CONTENT_ADMIN'

  if (!isAdminLevel) {
    return {
      navGroups: generalSidebarData,
    }
  }

  return {
    navGroups: [...superAdminSidebarData],
  }
}
