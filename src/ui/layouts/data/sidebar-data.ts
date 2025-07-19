import { IconHome, IconComponents, IconArticle } from '@tabler/icons-react'
import { Calendar, Mail, Newspaper, PartyPopper } from 'lucide-react'
import { NavGroup } from '../types'

export const superAdminSidebarData: NavGroup[] = [
  {
    items: [
      {
        title: 'Home',
        url: '/',
        icon: IconHome,
      },
      // {
      //   title: 'Organizations',
      //   url: '/organizations/list',
      //   icon: Building,
      // },
      {
        title: 'Events',
        url: '/events/list',
        icon: Calendar,
      },
      {
        title: 'News',
        url: '/news/list',
        icon: IconArticle,
      },
      {
        title: 'Opportunities',
        url: '/opportunities/list',
        icon: PartyPopper,
      },
      {
        title: 'Blogs',
        url: '/blog/list',
        icon: Newspaper,
      },
      {
        title: 'Tags',
        url: '/tags',
        icon: IconComponents,
      },
      {
        title: 'Subscribed Emails',
        url: '/subscribed-emails',
        icon: Mail,
      },
    ],
  },
]

export const generalSidebarData: NavGroup[] = []
