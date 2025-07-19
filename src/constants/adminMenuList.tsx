import {
  Calendar,
  FileText,
  Building2,
  LayoutDashboard,
  Users,
  Briefcase,
  BarChart3,
  Tags,
  Newspaper,
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
    title: 'Tags',
    href: '/tags/list',
    icon: Tags,
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
]
