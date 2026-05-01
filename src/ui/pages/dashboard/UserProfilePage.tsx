import { useEffect, useState } from 'react'
import apiClient from '@/query/apiClient'
import { useGetProfile } from '@/query/auth/use-auth'
import type { User as AuthStoreUser } from '@/schemas/auth/profile'
import ImageUpload from '@/ui/image-upload'
import ChangePasswordDialog from '@/ui/organisms/dashboard/ChangePasswordDialog'
import EditProfileDialog from '@/ui/organisms/dashboard/EditProfileDialog'
import EditProfilePhotoDialog from '@/ui/organisms/dashboard/EditProfilePhotoDialog'
import OrganizationProfilePage from '@/ui/pages/dashboard/organization-profile'
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/shadcn/avatar'
import { Button } from '@/ui/shadcn/button'
import { Card, CardContent } from '@/ui/shadcn/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/shadcn/dialog'
import { getInitialsForAvatar } from '@/ui/shadcn/lib/utils'
import { cn } from '@/ui/shadcn/lib/utils'
import {
  CalendarDays,
  Mail,
  User,
  Edit,
  Key,
  Pencil,
  Camera,
  Loader2,
  Briefcase,
  Linkedin,
  Facebook,
  Instagram,
} from 'lucide-react'
import type { UserOutput } from '@/api/types.gen'
import { useAuthStore } from '@/stores/authStore'
import { nullableString } from '@/utils/map-user-output'
import { toast } from '@/hooks/use-toast'

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
    bannerImageUrl: (u.bannerImageUrl ??
      null) as unknown as UserOutput['bannerImageUrl'],
    bannerImageId: (u.bannerImageId ??
      null) as unknown as UserOutput['bannerImageId'],
    bio: (u.bio ?? null) as unknown as UserOutput['bio'],
    currentRole: (u.currentRole ??
      null) as unknown as UserOutput['currentRole'],
    socials: (u.socials ?? null) as UserOutput['socials'],
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
  const user = (profileData || authUser) as AuthStoreUser | null
  const nameInitials = getInitialsForAvatar(user?.fullName || 'User')
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] =
    useState(false)
  const [isEditProfileDialogOpen, setIsEditProfileDialogOpen] = useState(false)
  const [isEditProfilePhotoDialogOpen, setIsEditProfilePhotoDialogOpen] =
    useState(false)
  const [isEditCoverOpen, setIsEditCoverOpen] = useState(false)

  const [bannerUrl, setBannerUrl] = useState<string | null>(null)
  const [bannerId, setBannerId] = useState<string | null>(null)

  useEffect(() => {
    if (isEditCoverOpen) {
      setBannerUrl(nullableString(user?.bannerImageUrl))
      setBannerId(nullableString(user?.bannerImageId))
    }
  }, [isEditCoverOpen, user])

  const handleSaveCover = async () => {
    try {
      await apiClient.patch('/api/v1/users/me', {
        bannerImageUrl: bannerUrl ?? undefined,
        bannerImageId: bannerId ?? undefined,
      })
      toast({ title: 'Cover updated' })
      refetch()
      setIsEditCoverOpen(false)
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Failed to update cover',
        variant: 'destructive',
      })
    }
  }

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

      <Card className='overflow-hidden border p-0 shadow-sm'>
        {/* Cover — LinkedIn-style header */}
        <div className='relative h-[min(28vw,200px)] min-h-[140px] w-full sm:min-h-[160px]'>
          <div
            className={cn(
              'absolute inset-0',
              user.bannerImageUrl
                ? 'bg-cover bg-center bg-no-repeat'
                : 'bg-gradient-to-br from-slate-200 via-sky-100/80 to-slate-300/90'
            )}
            style={
              user.bannerImageUrl
                ? { backgroundImage: `url(${user.bannerImageUrl})` }
                : undefined
            }
            role='img'
            aria-label='Profile cover'
          />
          <div className='pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/5' />
          <div className='absolute right-3 top-3 z-10'>
            <Button
              type='button'
              size='sm'
              variant='secondary'
              className='shadow-md'
              onClick={() => setIsEditCoverOpen(true)}
            >
              <Camera className='mr-2 h-4 w-4' />
              Edit profile cover
            </Button>
          </div>
        </div>

        <CardContent className='space-y-6 px-4 pb-6 pt-0 sm:px-6'>
          <div className='-mt-14 flex flex-col gap-4 sm:-mt-16 sm:flex-row sm:items-end sm:justify-between'>
            <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-5'>
              <div className='group relative h-[104px] w-[104px] shrink-0 sm:h-[120px] sm:w-[120px]'>
                <Avatar className='h-full w-full border-4 border-background bg-background text-2xl shadow-md ring-1 ring-border'>
                  <AvatarImage
                    src={String(user.profilePhotoUrl || '') || undefined}
                    alt={user.fullName}
                    className='object-cover'
                  />
                  <AvatarFallback className='text-2xl'>
                    {nameInitials}
                  </AvatarFallback>
                </Avatar>
                <Button
                  type='button'
                  size='icon'
                  variant='secondary'
                  className={cn(
                    'absolute bottom-1 right-1 h-9 w-9 rounded-full border-2 border-background shadow-md',
                    'bg-background/95 hover:bg-muted',
                    'opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:opacity-100'
                  )}
                  onClick={() => setIsEditProfilePhotoDialogOpen(true)}
                  aria-label='Edit profile photo'
                >
                  <Pencil className='h-4 w-4' />
                </Button>
              </div>
              <div className='space-y-0.5 pb-0.5 sm:pb-1'>
                <p className='text-sm text-muted-foreground'>Your account</p>
                <h3 className='text-2xl font-semibold leading-tight tracking-tight text-foreground'>
                  {user.fullName}
                </h3>
                <p className='text-sm text-muted-foreground'>Account holder</p>
              </div>
            </div>
          </div>

          <div className='space-y-4 border-t border-border/60 pt-4'>
            {/* Bio below name */}
            {String(profileData?.bio || '') ? (
              <div>
                <h4 className='text-sm font-medium text-muted-foreground'>
                  Bio
                </h4>
                <p className='whitespace-pre-wrap text-sm leading-relaxed text-foreground'>
                  {String(profileData?.bio)}
                </p>
              </div>
            ) : null}

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
              </div>
            </div>

            <div className='mt-4 flex flex-col gap-2 border-t border-border/60 pt-4'>
              <h4 className='text-sm font-medium text-muted-foreground'>
                Socials
              </h4>
              <div className='grid gap-3 sm:grid-cols-2'>
                {user.socials?.linkedin && (
                  <div className='flex items-center gap-2 text-sm'>
                    <Linkedin className='h-4 w-4 text-muted-foreground' />
                    <span className='font-medium'>LinkedIn:</span>
                    <a
                      href={String(user.socials.linkedin)}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-wrap break-all text-blue-600 hover:underline'
                    >
                      {String(user.socials.linkedin)}
                    </a>
                  </div>
                )}
                {user.socials?.facebook && (
                  <div className='flex items-center gap-2 text-sm'>
                    <Facebook className='h-4 w-4 text-muted-foreground' />
                    <span className='font-medium'>Facebook:</span>
                    <a
                      href={String(user.socials.facebook)}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-wrap break-all text-blue-600 hover:underline'
                    >
                      {String(user.socials.facebook)}
                    </a>
                  </div>
                )}
                {user.socials?.instagram && (
                  <div className='flex items-center gap-2 text-sm'>
                    <Instagram className='h-4 w-4 text-muted-foreground' />
                    <span className='font-medium'>Instagram:</span>
                    <a
                      href={String(user.socials.instagram)}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-wrap break-all text-blue-600 hover:underline'
                    >
                      {String(user.socials.instagram)}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
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
        onPhotoUpdated={() => refetch()}
      />

      <Dialog open={isEditCoverOpen} onOpenChange={setIsEditCoverOpen}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>Edit profile cover</DialogTitle>
            <DialogDescription>
              Upload a wide image (for example 1584×396 or similar). Max 5MB,
              JPG, PNG, or WebP.
            </DialogDescription>
          </DialogHeader>
          <div className='max-h-[60vh] overflow-y-auto pr-1'>
            <ImageUpload
              key={isEditCoverOpen ? 'open' : 'closed'}
              label='Upload cover'
              className='my-2 w-full max-w-full'
              handleImage={(id, url) => {
                setBannerId(id)
                setBannerUrl(url)
              }}
              initialImageId={bannerId}
              initialImageUrl={bannerUrl}
              inputId='account-profile-cover-upload'
            />
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setIsEditCoverOpen(false)}
            >
              Cancel
            </Button>
            <Button type='button' onClick={handleSaveCover}>
              Save cover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
