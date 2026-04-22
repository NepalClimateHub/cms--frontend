import { LinkProps } from '@tanstack/react-router'
import type { AppRole } from '@/utils/jwt.util'

interface BaseNavItem {
  title: string
  /** Roles that may see this entry in the sidebar (and intended route access). */
  roles: AppRole[]
  badge?: string
  icon?: React.ElementType
}

type NavLink = BaseNavItem & {
  url: LinkProps['to']
  items?: never
}

type NavCollapsible = BaseNavItem & {
  items: (BaseNavItem & { url: LinkProps['to'] })[]
  url?: never
}

type NavItem = NavCollapsible | NavLink

interface NavGroup {
  items: NavItem[]
}

interface SidebarData {
  navGroups: NavGroup[]
}

export type { SidebarData, NavGroup, NavItem, NavCollapsible, NavLink }
