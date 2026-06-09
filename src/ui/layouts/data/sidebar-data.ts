import { IconHome, IconArticle, IconSettings } from '@tabler/icons-react'
import {
  Calendar,
  Home,
  Mail,
  Newspaper,
  PartyPopper,
  User,
  MessageCircle,
  Briefcase,
  Library,
  Database,
} from 'lucide-react'
import { NavGroup } from '../types'

export enum Roles {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  CONTENT_ADMIN = 'CONTENT_ADMIN',
  ORGANIZATION = 'ORGANIZATION',
  INDIVIDUAL = 'INDIVIDUAL',
}

export const sidebarMenus: NavGroup[] = [
  {
    items: [
      {
        title: 'Home',
        url: '/',
        icon: IconHome,
        roles: [
          Roles.SUPER_ADMIN,
          Roles.ADMIN,
          Roles.CONTENT_ADMIN,
          Roles.ORGANIZATION,
        ],
      },
      {
        title: 'Events',
        url: '/events/list',
        icon: Calendar,
        roles: [Roles.SUPER_ADMIN, Roles.ADMIN, Roles.CONTENT_ADMIN],
      },
      {
        title: 'News',
        url: '/news/list',
        icon: IconArticle,
        roles: [Roles.SUPER_ADMIN, Roles.ADMIN, Roles.CONTENT_ADMIN],
      },
      {
        title: 'Opportunities',
        url: '/opportunities/list',
        icon: PartyPopper,
        roles: [Roles.SUPER_ADMIN, Roles.ADMIN, Roles.CONTENT_ADMIN],
      },
      {
        title: 'Work/Projects',
        url: '/projects',
        icon: Briefcase,
        roles: [Roles.SUPER_ADMIN, Roles.ADMIN, Roles.CONTENT_ADMIN],
      },
      {
        title: 'Resources',
        url: '/resources',
        icon: Library,
        roles: [Roles.SUPER_ADMIN, Roles.ADMIN, Roles.CONTENT_ADMIN],
      },
      {
        title: 'Blogs',
        url: '/blog/list',
        icon: Newspaper,
        roles: [
          Roles.SUPER_ADMIN,
          Roles.ADMIN,
          Roles.CONTENT_ADMIN,
          Roles.INDIVIDUAL,
          Roles.ORGANIZATION,
        ],
      },
      {
        title: 'Users',
        url: '/users',
        icon: User,
        roles: [Roles.SUPER_ADMIN, Roles.ADMIN],
      },
      {
        title: 'Subscribed Emails',
        url: '/subscribed-emails',
        icon: Mail,
        roles: [Roles.SUPER_ADMIN, Roles.ADMIN, Roles.CONTENT_ADMIN],
      },
      {
        title: 'Ask AI',
        url: '/ask-ai',
        icon: MessageCircle,
        roles: [
          Roles.SUPER_ADMIN,
          Roles.ADMIN,
          Roles.CONTENT_ADMIN,
          Roles.INDIVIDUAL,
          Roles.ORGANIZATION,
        ],
      },
      {
        title: 'Setup',
        url: '/setup',
        icon: IconSettings,
        roles: [Roles.SUPER_ADMIN, Roles.ADMIN, Roles.CONTENT_ADMIN],
      },
      {
        title: 'Database Export',
        url: '/database/export',
        icon: Database,
        roles: [Roles.SUPER_ADMIN, Roles.ADMIN],
      },
    ],
  },
]

/** Minimal nav for `INDIVIDUAL` (and non-org fallback); filtered by `roles` in `useSideBarData`. */
export const generalSidebarData: NavGroup[] = [
  {
    items: [
      {
        title: 'Dashboard',
        url: '/',
        icon: Home,
        roles: [Roles.INDIVIDUAL],
      },
      {
        title: 'Blogs',
        url: '/blog/list',
        icon: Newspaper,
        roles: [Roles.INDIVIDUAL],
      },
      {
        title: 'Ask AI',
        url: '/ask-ai',
        icon: MessageCircle,
        roles: [Roles.INDIVIDUAL],
      },
    ],
  },
]
