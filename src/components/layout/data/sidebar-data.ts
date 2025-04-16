import { IconHome, IconComponents } from '@tabler/icons-react'
import { Building, Calendar, Newspaper, PartyPopper } from 'lucide-react'
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
        icon: Building,
      },
      {
        title: 'Events',
        url: '/events/list',
        icon: Calendar,
      },
      {
        title: 'News',
        url: '/news/list',
        icon: Newspaper,
      },
      {
        title: 'Opportunities',
        url: '/opportunities/list',
        icon: PartyPopper,
      },

      {
        title: 'Tags',
        url: '/tags',
        icon: IconComponents,
      },
    ],
  },
]

export const generalSidebarData: NavGroup[] = []
