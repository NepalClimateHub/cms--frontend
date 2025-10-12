import { Avatar, AvatarFallback, AvatarImage } from '@/ui/shadcn/avatar'
import { getInitialsForAvatar } from '@/ui/shadcn/lib/utils'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/ui/shadcn/sidebar'
import { useAuthStore } from '@/stores/authStore'
import { Link } from '@tanstack/react-router'

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
          <Link to='/profile'>
          <div className='grid flex-1 text-left text-sm leading-tight'>
            <span className='truncate font-semibold'>
              {user?.isSuperAdmin ? 'Super Admin' : user?.organization?.name}
            </span>
            <span className='truncate text-xs text-muted-foreground'>
              {user?.email}
            </span>
          </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
