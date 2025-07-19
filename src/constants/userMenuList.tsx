import {
  Briefcase,
  Calendar,
  FileText,
  LayoutDashboard,
  User,
  Newspaper,
  Settings,
} from 'lucide-react'

export const dashboardNavItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Blogs',
    href: '/blog/list',
    icon: FileText,
  },
  {
    title: 'Events',
    href: '/events/list',
    icon: Calendar,
  },
  {
    title: 'Opportunities',
    href: '/opportunities/list',
    icon: Briefcase,
  },
  {
    title: 'News',
    href: '/news/list',
    icon: Newspaper,
  },
  {
    title: 'Profile',
    href: '/profile',
    icon: User,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
]
