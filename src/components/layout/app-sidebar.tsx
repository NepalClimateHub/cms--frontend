import { cn } from '@/lib/utils'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { NavGroup } from '@/components/layout/nav-group'
import { ProfileCard } from '../profile-card'
import { useSideBarData } from './data/use-sidebar-data'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const sidebarData = useSideBarData()
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
      <SidebarRail className='border-l border-border/40' />
    </Sidebar>
  )
}
