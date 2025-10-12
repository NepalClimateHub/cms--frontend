import { useLogout } from '@/query/auth/use-auth'
import { NavGroup } from '@/ui/layouts/nav-group'
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
} from '@/ui/shadcn/sidebar'
import { LogOut } from 'lucide-react'
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
        <div className='flex items-center px-3 py-4'>
          <img
            src='images/logo.png'
            alt='Nepal Climate Hub'
            className='mr-3 h-8 w-8'
          />
          <span className='text-lg font-bold text-foreground'>
            NCH Dashboard
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent className='py-4'>
        {sidebarData.navGroups.map((group, index) => (
          <>
            <NavGroup {...group} />
            {index < sidebarData.navGroups.length - 1 && (
              <SidebarSeparator className='my-4' />
            )}
          </>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <ProfileCard />
          <SidebarSeparator className='my-2' />
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
