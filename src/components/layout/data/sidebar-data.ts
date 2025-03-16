import { IconHome, IconComponents } from '@tabler/icons-react'
import { NavGroup } from '../types'

export const superAdminSidebarData: NavGroup[] = [
  {
    title: 'Administrative',
    items: [
      {
        title: 'Home',
        url: '/',
        icon: IconHome,
      },
      {
        title: 'Organizations',
        url: '/organizations/list',
        icon: IconComponents,
      },
    ],
  },
]

export const generalSidebarData: NavGroup[] = []
