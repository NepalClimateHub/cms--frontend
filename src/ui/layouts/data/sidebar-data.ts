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
} from 'lucide-react'
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
        title: 'Work/Projects',
        url: '/projects',
        icon: Briefcase,
      },
      {
        title: 'Resources',
        url: '/resources',
        icon: Library,
      },
      {
        title: 'Blogs',
        url: '/blog/list',
        icon: Newspaper,
      },
      {
        title: 'Users',
        url: '/users',
        icon: User,
      },

      {
        title: 'Subscribed Emails',
        url: '/subscribed-emails',
        icon: Mail,
      },
      {
        title: 'Ask AI',
        url: '/ask-ai',
        icon: MessageCircle,
      },
      {
        title: 'Setup',
        url: '/setup',
        icon: IconSettings,
      },
    ],
  },
]

export const generalSidebarData: NavGroup[] = [
  {
    items: [
      {
        title: 'Dashboard',
        url: '/',
        icon: Home,
      },
      {
        title: 'Blogs',
        url: '/blog/list',
        icon: Newspaper,
      },
      {
        title: 'Ask AI',
        url: '/ask-ai',
        icon: MessageCircle,
      },
    ],
  },
]
