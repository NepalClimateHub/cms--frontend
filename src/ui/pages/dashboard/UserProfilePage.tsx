import { useState } from 'react'
import { useGetProfile } from '@/query/auth/use-auth'
import type { User as AuthStoreUser } from '@/schemas/auth/profile'
import ChangePasswordDialog from '@/ui/organisms/dashboard/ChangePasswordDialog'
import EditProfileDialog from '@/ui/organisms/dashboard/EditProfileDialog'
import EditProfilePhotoDialog from '@/ui/organisms/dashboard/EditProfilePhotoDialog'
import OrganizationProfilePage from '@/ui/pages/dashboard/organization-profile'
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
import {
  CalendarDays,
  Mail,
  Shield,
  User,
  Edit,
  Key,
  Pencil,
  Loader2,
  Briefcase,
  Linkedin,
} from 'lucide-react'
import type { UserOutput } from '@/api/types.gen'
import { useAuthStore } from '@/stores/authStore'

function authStoreUserToUserOutput(u: AuthStoreUser): UserOutput {
  return {
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    isEmailVerified: u.isActive,
    isVerifiedByAdmin: u.isVerifiedByAdmin ?? false,
    isSuperAdmin: u.role === 'SUPER_ADMIN',
    role: (u.role ?? 'INDIVIDUAL') as UserOutput['role'],
    gender: {} as UserOutput['gender'],
    phoneCountryCode: {} as UserOutput['phoneCountryCode'],
    phoneNumber: {} as UserOutput['phoneNumber'],
    profilePhotoUrl: (u.profilePhotoUrl ??
      null) as unknown as UserOutput['profilePhotoUrl'],
    profilePhotoId: (u.profilePhotoId ??
      null) as unknown as UserOutput['profilePhotoId'],
    bio: (u.bio ?? null) as unknown as UserOutput['bio'],
    linkedin: (u.linkedin ?? null) as unknown as UserOutput['linkedin'],
    currentRole: (u.currentRole ??
      null) as unknown as UserOutput['currentRole'],
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
    organization: (u.organization ?? null) as UserOutput['organization'],
  }
}

function shouldShowOrganizationProfile(
  accountRole: string | undefined,
  organization: UserOutput['organization'] | null | undefined
): boolean {
  const t = accountRole?.toString().trim().toUpperCase()
  if (t === 'ORGANIZATION') return true
  return Boolean(organization)
}

export default function UserProfilePage() {
  const { user: authUser } = useAuthStore()
  const { data: profileData, isLoading, refetch } = useGetProfile()

  // Use profile data from API if available, otherwise fallback to auth store user
  const user = profileData || authUser
  const nameInitials = getInitialsForAvatar(user?.fullName || 'User')
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] =
    useState(false)
  const [isEditProfileDialogOpen, setIsEditProfileDialogOpen] = useState(false)
  const [isEditProfilePhotoDialogOpen, setIsEditProfilePhotoDialogOpen] =
    useState(false)

  if (isLoading) {
    return (
      <div className='flex min-h-[400px] items-center justify-center'>
        <div className='text-center'>
          <Loader2 className='mx-auto h-12 w-12 animate-spin text-muted-foreground' />
          <h3 className='mt-2 text-sm font-semibold text-gray-900'>
            Loading profile...
          </h3>
        </div>
      </div>
    )
  }

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

  const resolvedRole = profileData?.role ?? authUser?.role
  const resolvedOrganization =
    profileData?.organization ?? authUser?.organization ?? null

  const showOrganizationProfile = shouldShowOrganizationProfile(
    resolvedRole,
    resolvedOrganization as UserOutput['organization'] | null | undefined
  )

  if (showOrganizationProfile) {
    const userForOrgPage: UserOutput =
      profileData != null
        ? {
            ...profileData,
            role: (resolvedRole ?? profileData.role) as UserOutput['role'],
            organization:
              (resolvedOrganization as UserOutput['organization']) ??
              profileData.organization ??
              null,
          }
        : authStoreUserToUserOutput(authUser!)

    return (
      <OrganizationProfilePage
        user={userForOrgPage}
        onUserUpdated={() => refetch()}
      />
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
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setIsChangePasswordDialogOpen(true)}
          >
            <Key className='mr-2 h-4 w-4' />
            Change Password
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setIsEditProfileDialogOpen(true)}
          >
            <Edit className='mr-2 h-4 w-4' />
            Edit Profile
          </Button>
        </div>
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
                    src={String(user.profilePhotoUrl || '') || undefined}
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
              <div className='flex-1 space-y-2'>
                <div className='space-y-2'>
                  <h3 className='text-2xl font-semibold'>{user.fullName}</h3>
                  <div className='flex items-center gap-2'>
                    {user.role === 'SUPER_ADMIN' && (
                      <Badge variant='destructive'>
                        <Shield className='mr-1 h-3 w-3' />
                        Super Admin
                      </Badge>
                    )}
                  </div>
                </div>
                {/* Bio below name */}
                {String(profileData?.bio || '') ? (
                  <p className='whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground'>
                    {String(profileData?.bio)}
                  </p>
                ) : null}
              </div>
            </div>

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
                {user.currentRole && (
                  <div className='flex items-center gap-2 text-sm'>
                    <Briefcase className='h-4 w-4 text-muted-foreground' />
                    <span className='font-medium'>Role:</span>
                    <span className='text-muted-foreground'>
                      {String(user.currentRole)}
                    </span>
                  </div>
                )}
                {user.linkedin && (
                  <div className='flex items-center gap-2 text-sm'>
                    <Linkedin className='h-4 w-4 text-muted-foreground' />
                    <span className='font-medium'>LinkedIn:</span>
                    <a
                      href={String(user.linkedin)}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-blue-600 hover:underline'
                    >
                      {String(user.linkedin)}
                    </a>
                  </div>
                )}
              </div>
            </div>
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
        onProfileUpdated={() => refetch()}
      />
      <EditProfilePhotoDialog
        open={isEditProfilePhotoDialogOpen}
        onOpenChange={setIsEditProfilePhotoDialogOpen}
      />
    </div>
  )
}
