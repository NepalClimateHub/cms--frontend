import { Avatar, AvatarFallback, AvatarImage } from '@/ui/shadcn/avatar'
import { getInitialsForAvatar } from '@/ui/shadcn/lib/utils'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/ui/shadcn/sidebar'
import { useAuthStore } from '@/stores/authStore'
import { useNavigate } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'

export function ProfileCard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const nameInitials = getInitialsForAvatar(user?.fullName || 'User')

  const handleProfileClick = () => {
    navigate({ to: '/dashboard/profile' })
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size='lg'
          onClick={handleProfileClick}
          className='group cursor-pointer bg-sidebar-accent text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
        >
          <Avatar className='h-8 w-8 rounded-lg border border-border/40'>
            <AvatarImage
              src={user?.profilePhotoUrl || undefined}
              alt={user?.fullName || 'User'}
            />
            <AvatarFallback className='rounded-lg bg-primary/10 text-primary'>
              {nameInitials}
            </AvatarFallback>
          </Avatar>
          <div className='flex flex-1 items-center gap-2 overflow-hidden'>
            <div className='grid flex-1 text-left text-sm leading-tight'>
              <span className='truncate font-semibold'>
                {user?.isSuperAdmin ? 'Super Admin' : user?.organization?.name}
              </span>
              <span className='truncate text-xs text-muted-foreground group-hover:hidden'>
                {user?.email}
              </span>
              <div className='hidden items-center gap-2 text-xs group-hover:flex'>
                <span>View Account</span>
                <ChevronRight className='h-4 w-4' />
              </div>
            </div>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
