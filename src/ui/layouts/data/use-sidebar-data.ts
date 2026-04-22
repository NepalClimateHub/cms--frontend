import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { analyticsControllerGetAdminAnalyticsOptions } from '@/api/@tanstack/react-query.gen'
import type { AppRole } from '@/utils/jwt.util'
import { getRoleFromToken } from '@/utils/jwt.util'
import { SidebarData, NavGroup, NavItem } from '../types'
import { generalSidebarData, sidebarMenus } from './sidebar-data'

function filterNavItems(items: NavItem[], role: AppRole): NavItem[] {
  const out: NavItem[] = []
  for (const item of items) {
    const hasNested = 'items' in item && Array.isArray(item.items)
    if (!hasNested && 'url' in item) {
      if (item.roles.includes(role)) out.push(item)
      continue
    }
    if (hasNested && item.items) {
      const subs = item.items.filter((s) => s.roles.includes(role))
      if (subs.length > 0 && item.roles.includes(role)) {
        out.push({ ...item, items: subs })
      }
    }
  }
  return out
}

function applyMenus(
  groups: NavGroup[],
  role: AppRole,
  pendingVerificationBadge?: string
): NavGroup[] {
  return groups
    .map((group) => ({
      ...group,
      items: filterNavItems(group.items, role).map((item) => {
        if (
          'url' in item &&
          item.url === '/users' &&
          pendingVerificationBadge
        ) {
          return { ...item, badge: pendingVerificationBadge }
        }
        return item
      }),
    }))
    .filter((g) => g.items.length > 0)
}

export const useSideBarData = (): SidebarData => {
  const role = getRoleFromToken()
  const isAdminLevel =
    role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'CONTENT_ADMIN'

  const { data: adminDashboardResponse } = useQuery({
    ...analyticsControllerGetAdminAnalyticsOptions(),
    enabled: isAdminLevel,
  })

  const pendingVerificationBadge = useMemo(() => {
    const n = adminDashboardResponse?.data
      ?.pendingOrganizationVerificationCount
    if (n == null || n <= 0) return undefined
    return n > 99 ? '99+' : String(n)
  }, [adminDashboardResponse?.data])

  const navGroups = useMemo(() => {
    const effectiveRole: AppRole = role ?? 'INDIVIDUAL'

    if (!isAdminLevel) {
      if (role === 'ORGANIZATION') {
        return applyMenus(
          sidebarMenus,
          effectiveRole,
          pendingVerificationBadge
        )
      }
      return applyMenus(generalSidebarData, effectiveRole)
    }

    return applyMenus(sidebarMenus, effectiveRole, pendingVerificationBadge)
  }, [isAdminLevel, role, pendingVerificationBadge])

  return {
    navGroups,
  }
}
