import { useState } from 'react'
import ChangePasswordDialog from '@/ui/organisms/dashboard/ChangePasswordDialog'
import EditProfileDialog from '@/ui/organisms/dashboard/EditProfileDialog'
import EditProfilePhotoDialog from '@/ui/organisms/dashboard/EditProfilePhotoDialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/shadcn/avatar'
import { Badge } from '@/ui/shadcn/badge'
import { Button } from '@/ui/shadcn/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/ui/shadcn/card'
import { getInitialsForAvatar } from '@/ui/shadcn/lib/utils'
import { cn } from '@/ui/shadcn/lib/utils'
import { Separator } from '@/ui/shadcn/separator'
import {
  CalendarDays,
  Mail,
  Shield,
  User,
  Edit,
  Settings,
  Key,
  Pencil,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

export default function UserProfilePage() {
  const { user } = useAuthStore()
  const nameInitials = getInitialsForAvatar(user?.fullName || 'User')
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] =
    useState(false)
  const [isEditProfileDialogOpen, setIsEditProfileDialogOpen] = useState(false)
  const [isEditProfilePhotoDialogOpen, setIsEditProfilePhotoDialogOpen] =
    useState(false)

  if (!user) {
    return (
      <div className='flex min-h-[400px] items-center justify-center'>
        <div className='text-center'>
          <User className='mx-auto h-12 w-12 text-muted-foreground' />
          <h3 className='mt-2 text-sm font-semibold text-gray-900'>
            No user data
          </h3>
          <p className='mt-1 text-sm text-muted-foreground'>
            Please log in to view your profile.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='container mx-auto space-y-6 p-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Profile</h1>
          <p className='text-muted-foreground'>
            Manage your account settings and view your information.
          </p>
        </div>
        <Button
          variant='outline'
          size='sm'
          onClick={() => setIsEditProfileDialogOpen(true)}
        >
          <Edit className='mr-2 h-4 w-4' />
          Edit Profile
        </Button>
      </div>

      <div className='space-y-6'>
        {/* User Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <User className='h-5 w-5' />
              Personal Information
            </CardTitle>
            <CardDescription>
              Your personal details and account information.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Avatar and Basic Info */}
            <div className='flex items-center space-x-4'>
              <div className='group relative'>
                <Avatar className='h-20 w-20'>
                  <AvatarImage
                    src={user.profilePhotoUrl || undefined}
                    alt={user.fullName}
                  />
                  <AvatarFallback className='text-lg'>
                    {nameInitials}
                  </AvatarFallback>
                </Avatar>
                <Button
                  type='button'
                  size='icon'
                  variant='secondary'
                  className={cn(
                    'absolute bottom-0 right-0 h-7 w-7 rounded-full border-2 border-white shadow-md',
                    'opacity-0 transition-opacity duration-200 group-hover:opacity-100',
                    'bg-white hover:bg-gray-100'
                  )}
                  onClick={() => setIsEditProfilePhotoDialogOpen(true)}
                >
                  <Pencil className='h-3.5 w-3.5' />
                </Button>
              </div>
              <div className='space-y-1'>
                <h3 className='text-2xl font-semibold'>{user.fullName}</h3>
                <div className='flex items-center gap-2'>
                  {user.isSuperAdmin && (
                    <Badge variant='destructive'>
                      <Shield className='mr-1 h-3 w-3' />
                      Super Admin
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Contact Information */}
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm'>
                  <Mail className='h-4 w-4 text-muted-foreground' />
                  <span className='font-medium'>Email:</span>
                  <span className='text-muted-foreground'>{user.email}</span>
                </div>
              </div>
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm'>
                  <CalendarDays className='h-4 w-4 text-muted-foreground' />
                  <span className='font-medium'>Member since:</span>
                  <span className='text-muted-foreground'>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <Separator />
          </CardContent>
        </Card>

        {/* Account Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Settings className='h-5 w-5' />
              Account Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant='outline'
              size='sm'
              className='w-1/3'
              onClick={() => setIsChangePasswordDialogOpen(true)}
            >
              <Key className='mr-2 h-4 w-4' />
              Change Password
            </Button>
          </CardContent>
        </Card>
      </div>

      <ChangePasswordDialog
        open={isChangePasswordDialogOpen}
        onOpenChange={setIsChangePasswordDialogOpen}
      />
      <EditProfileDialog
        open={isEditProfileDialogOpen}
        onOpenChange={setIsEditProfileDialogOpen}
      />
      <EditProfilePhotoDialog
        open={isEditProfilePhotoDialogOpen}
        onOpenChange={setIsEditProfilePhotoDialogOpen}
      />
    </div>
  )
}
