import { useLogout } from '@/query/auth/use-auth'
import { LogOut } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'
import { NavGroup } from '@/components/layout/nav-group'
import { ProfileCard } from '../profile-card'
import { useSideBarData } from './data/use-sidebar-data'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const sidebarData = useSideBarData()
  const logout = useLogout()

  return (
    <Sidebar
      collapsible='icon'
      variant='floating'
      className='border-r border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'
      {...props}
    >
      <SidebarHeader className='border-b border-border/40'>
        <ProfileCard />
      </SidebarHeader>
      <SidebarContent className='py-4'>
        {sidebarData.navGroups.map((group, index) => (
          <div key={group.title}>
            <NavGroup {...group} />
            {index < sidebarData.navGroups.length - 1 && (
              <SidebarSeparator className='my-4' />
            )}
          </div>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout} tooltip='Logout'>
              <LogOut className='h-4 w-4' />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail className='border-l border-border/40' />
    </Sidebar>
  )
}
