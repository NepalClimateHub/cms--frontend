import { useAuthStore } from '@/stores/authStore'
import { getInitialsForAvatar } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

export function ProfileCard() {
  const { user } = useAuthStore()
  const nameInitials = getInitialsForAvatar(user?.fullName || 'User')

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size='lg'
          className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
        >
          <Avatar className='h-8 w-8 rounded-lg border border-border/40'>
            {/* @ts-ignore */}
            <AvatarImage src={user?.avatar} alt={user?.fullName} />
            <AvatarFallback className='rounded-lg bg-primary/10 text-primary'>
              {nameInitials}
            </AvatarFallback>
          </Avatar>
          <div className='grid flex-1 text-left text-sm leading-tight'>
            <span className='truncate font-semibold'>
              {user?.isSuperAdmin ? 'Super Admin' : user?.organization?.name}
            </span>
            <span className='truncate text-xs text-muted-foreground'>
              {user?.email}
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
