import { useEffect, useState } from 'react'
import { usePatchMyOrganization } from '@/query/users/use-my-organization'
import ImageUpload from '@/ui/image-upload'
import ChangePasswordDialog from '@/ui/organisms/dashboard/ChangePasswordDialog'
import EditProfileDialog from '@/ui/organisms/dashboard/EditProfileDialog'
import OrganizationVerifyDialog from '@/ui/organisms/dashboard/organization-verify-dialog'
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
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  Edit,
  Key,
  Mail,
  Pencil,
  ShieldAlert,
  User,
  Loader2,
} from 'lucide-react'
import type { UserOutput } from '@/api/types.gen'
import { toast } from '@/hooks/use-toast'

type OrganizationProfilePageProps = {
  user: UserOutput
  onUserUpdated: () => void
}

export default function OrganizationProfilePage({
  user,
  onUserUpdated,
}: OrganizationProfilePageProps) {
  const org = user.organization
  const nameInitials = getInitialsForAvatar(user.fullName || 'User')

  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] =
    useState(false)
  const [isEditProfileDialogOpen, setIsEditProfileDialogOpen] = useState(false)
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false)

  const patchOrg = usePatchMyOrganization()
  const [logoUrl, setLogoUrl] = useState<string | null>(
    org?.logoImageUrl ?? null
  )
  const [logoId, setLogoId] = useState<string | null>(org?.logoImageId ?? null)

  useEffect(() => {
    if (org) {
      setLogoUrl(org.logoImageUrl)
      setLogoId(org.logoImageId)
    }
  }, [org?.id, org?.logoImageUrl, org?.logoImageId])

  const handleSaveLogo = () => {
    if (!org) return
    if (!logoUrl) {
      toast({
        title: 'Logo required',
        description: 'Please upload an organization logo.',
        variant: 'destructive',
      })
      return
    }
    patchOrg.mutate(
      {
        logoImageUrl: logoUrl,
        logoImageId: logoId ?? undefined,
      },
      {
        onSuccess: () => {
          toast({ title: 'Logo updated' })
          onUserUpdated()
        },
      }
    )
  }

  if (!org) {
    return (
      <div className='container mx-auto space-y-6 p-6'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Organization profile
          </h1>
          <p className='text-muted-foreground'>
            We could not find an organization linked to your account (
            <span className='font-medium text-foreground'>{user.email}</span>
            ). Ask an administrator to link your user account to an organization
            record (<code className='text-xs'>User.organizationId</code>
            ).
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <ShieldAlert className='h-5 w-5 text-amber-600' />
              No organization linked
            </CardTitle>
            <CardDescription>
              After your account is linked to an organization record, reload
              this page to manage logo and verification.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const pendingVerification =
    !org.isVerifiedByAdmin &&
    Boolean(org.verificationRequestedAt || org.verificationDocumentUrl)

  return (
    <div className='container mx-auto space-y-6 p-6'>
      <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Organization profile
          </h1>
          <p className='text-muted-foreground'>
            Manage your organization branding and verification on Nepal Climate
            Hub.
          </p>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
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
            Edit account
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Building2 className='h-5 w-5' />
            {org.name}
          </CardTitle>
          <CardDescription>
            Public organization name as shown on the hub (from your organization
            listing).
          </CardDescription>
          <div className='flex flex-wrap gap-2 pt-2'>
            {org.isVerifiedByAdmin ? (
              <Badge
                variant='default'
                className='bg-emerald-600 hover:bg-emerald-600'
              >
                <CheckCircle2 className='mr-1 h-3 w-3' />
                Verified organization
              </Badge>
            ) : pendingVerification ? (
              <Badge variant='secondary'>
                <Clock className='mr-1 h-3 w-3' />
                Verification pending review
              </Badge>
            ) : (
              <Badge variant='outline'>Not verified</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div>
            <h4 className='mb-3 text-sm font-medium'>Organization logo</h4>
            <p className='mb-4 text-sm text-muted-foreground'>
              This logo represents your organization on the site. It is separate
              from your personal profile photo.
            </p>
            <div className='flex max-w-md flex-col gap-4'>
              <ImageUpload
                label='Upload logo'
                handleImage={(id, url) => {
                  setLogoId(id)
                  setLogoUrl(url)
                }}
                initialImageId={logoId}
                initialImageUrl={logoUrl}
                inputId='organization-logo-upload'
              />
              <Button
                type='button'
                onClick={handleSaveLogo}
                disabled={patchOrg.isPending || !logoUrl}
                className='w-fit'
              >
                {patchOrg.isPending ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Saving…
                  </>
                ) : (
                  'Save logo'
                )}
              </Button>
            </div>
          </div>

          {!org.isVerifiedByAdmin ? (
            <div className='rounded-lg border border-dashed bg-muted/30 p-4'>
              <p className='mb-3 text-sm text-muted-foreground'>
                Submit documents and a short message so an administrator can
                verify your organization.
              </p>
              <Button
                type='button'
                variant='secondary'
                onClick={() => setIsVerifyDialogOpen(true)}
              >
                Verify organization
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <User className='h-5 w-5' />
            Your account
          </CardTitle>
          <CardDescription>
            Personal login details (profile photo is for your account only).
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='flex items-center space-x-4'>
            <div className='group relative'>
              <Avatar className='h-16 w-16'>
                <AvatarImage
                  src={user.profilePhotoUrl || undefined}
                  alt={user.fullName}
                />
                <AvatarFallback className='text-base'>
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
                onClick={() => setIsEditProfileDialogOpen(true)}
              >
                <Pencil className='h-3.5 w-3.5' />
              </Button>
            </div>
            <div>
              <h3 className='text-lg font-semibold'>{user.fullName}</h3>
              <p className='text-sm text-muted-foreground'>Account holder</p>
            </div>
          </div>
          <div className='grid gap-3 md:grid-cols-2'>
            <div className='flex items-center gap-2 text-sm'>
              <Mail className='h-4 w-4 text-muted-foreground' />
              <span className='font-medium'>Email:</span>
              <span className='text-muted-foreground'>{user.email}</span>
            </div>
            <div className='flex items-center gap-2 text-sm'>
              <CalendarDays className='h-4 w-4 text-muted-foreground' />
              <span className='font-medium'>Member since:</span>
              <span className='text-muted-foreground'>
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <ChangePasswordDialog
        open={isChangePasswordDialogOpen}
        onOpenChange={setIsChangePasswordDialogOpen}
      />
      <EditProfileDialog
        open={isEditProfileDialogOpen}
        onOpenChange={setIsEditProfileDialogOpen}
        onProfileUpdated={() => onUserUpdated()}
      />
      <OrganizationVerifyDialog
        open={isVerifyDialogOpen}
        onOpenChange={setIsVerifyDialogOpen}
        organization={org}
        onSubmitted={() => onUserUpdated()}
      />
    </div>
  )
}
