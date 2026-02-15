import {
  Calendar,
  FileText,
  Building2,
  LayoutDashboard,
  Users,
  Briefcase,
  BarChart3,
  Newspaper,
  Settings,
} from 'lucide-react'

export const adminNavItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Users',
    href: '/users',
    icon: Users,
  },
  {
    title: 'Organizations',
    href: '/organizations',
    icon: Building2,
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
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
  {
    title: 'Setup',
    href: '/setup',
    icon: Settings,
  },
]
