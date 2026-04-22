import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { usePatchMyOrganization } from '@/query/users/use-my-organization'
import type { SocialType } from '@/schemas/shared'
import ImageUpload from '@/ui/image-upload'
import ChangePasswordDialog from '@/ui/organisms/dashboard/ChangePasswordDialog'
import EditProfilePhotoDialog from '@/ui/organisms/dashboard/EditProfilePhotoDialog'
import OrganizationVerificationViewDialog from '@/ui/organisms/dashboard/organization-verification-view-dialog'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/shadcn/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/shadcn/form'
import { Input } from '@/ui/shadcn/input'
import { getInitialsForAvatar } from '@/ui/shadcn/lib/utils'
import { cn } from '@/ui/shadcn/lib/utils'
import { Textarea } from '@/ui/shadcn/textarea'
import {
  Building2,
  CalendarDays,
  Camera,
  CheckCircle2,
  Clock,
  Edit,
  Key,
  Mail,
  Pencil,
  ShieldAlert,
  Loader2,
  ClipboardList,
  MapPin,
  Share2,
  Tags,
} from 'lucide-react'
import type { UserOutput } from '@/api/types.gen'
import { toast } from '@/hooks/use-toast'
import {
  mapOrganizationProfileDto,
  nullableString,
} from '@/utils/map-user-output'

const orgDetailsFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(300),
  description: z.string().min(1, 'Description is required').max(20_000),
  organizationType: z.string().max(200).optional().or(z.literal('')),
  street: z.string().max(500).optional().or(z.literal('')),
  city: z.string().max(200).optional().or(z.literal('')),
  state: z.string().max(200).optional().or(z.literal('')),
  country: z.string().max(100).optional().or(z.literal('')),
  postcode: z.string().max(30).optional().or(z.literal('')),
  facebook: z.string().optional().or(z.literal('')),
  instagram: z.string().optional().or(z.literal('')),
  linkedin: z.string().optional().or(z.literal('')),
})

type OrgDetailsForm = z.infer<typeof orgDetailsFormSchema>

type NormalizedOrgSocials = {
  facebook: string
  instagram: string
  linkedin: string
}

function formatSocialsFromUser(raw: UserOutput['socials']): NormalizedOrgSocials {
  if (!raw || typeof raw !== 'object') {
    return { facebook: '', instagram: '', linkedin: '' }
  }
  const o = raw as Record<string, unknown>
  return {
    facebook: typeof o.facebook === 'string' ? o.facebook : '',
    instagram: typeof o.instagram === 'string' ? o.instagram : '',
    linkedin: typeof o.linkedin === 'string' ? o.linkedin : '',
  }
}

function formatLocation(org: UserOutput['organization']) {
  const adr = org?.address
  if (!adr) return '—'
  const parts = [
    adr.street,
    [adr.city, adr.state].filter(Boolean).join(', '),
    adr.postcode,
    adr.country,
  ]
    .map((p) => (typeof p === 'string' ? p.trim() : ''))
    .filter(Boolean)
  return parts.length ? parts.join(' · ') : '—'
}

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
  const [isEditProfilePhotoOpen, setIsEditProfilePhotoOpen] = useState(false)
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false)
  const [isViewApplicationOpen, setIsViewApplicationOpen] = useState(false)
  const [isEditCoverOpen, setIsEditCoverOpen] = useState(false)
  const [isEditOrgDetailsOpen, setIsEditOrgDetailsOpen] = useState(false)

  const orgForm = useForm<OrgDetailsForm>({
    resolver: zodResolver(orgDetailsFormSchema),
    defaultValues: {
      name: '',
      description: '',
      organizationType: '',
      street: '',
      city: '',
      state: '',
      country: '',
      postcode: '',
      facebook: '',
      instagram: '',
      linkedin: '',
    },
  })

  const patchOrg = usePatchMyOrganization()
  const [bannerUrl, setBannerUrl] = useState<string | null>(
    nullableString(user.bannerImageUrl)
  )
  const [bannerId, setBannerId] = useState<string | null>(
    nullableString(user.bannerImageId)
  )

  useEffect(() => {
    setBannerUrl(nullableString(user.bannerImageUrl))
    setBannerId(nullableString(user.bannerImageId))
  }, [user.bannerImageUrl, user.bannerImageId])

  const handleSaveCover = () => {
    if (!org) return
    patchOrg.mutate(
      {
        bannerImageUrl: bannerUrl ?? undefined,
        bannerImageId: bannerId ?? undefined,
      },
      {
        onSuccess: () => {
          toast({ title: 'Cover updated' })
          onUserUpdated()
          setIsEditCoverOpen(false)
        },
      }
    )
  }

  useEffect(() => {
    if (!isEditOrgDetailsOpen || !org) return
    const s = formatSocialsFromUser(user.socials)
    orgForm.reset({
      name: org.name,
      description: org.description ?? '',
      organizationType: org.organizationType ?? '',
      street: org.address?.street ?? '',
      city: org.address?.city ?? '',
      state: org.address?.state ?? '',
      country: org.address?.country ?? '',
      postcode: org.address?.postcode ?? '',
      ...s,
    })
  }, [isEditOrgDetailsOpen, org, user.socials, orgForm])

  const onSubmitOrgDetails = (values: OrgDetailsForm) => {
    if (!org) return
    const typeTrim = values.organizationType?.trim()
    const socials: SocialType = {
      facebook: values.facebook?.trim() || undefined,
      instagram: values.instagram?.trim() || undefined,
      linkedin: values.linkedin?.trim() || undefined,
    }
    patchOrg.mutate(
      {
        name: values.name.trim(),
        description: values.description.trim(),
        organizationType: typeTrim ? typeTrim : null,
        address: {
          street: values.street?.trim() || null,
          city: values.city?.trim() || null,
          state: values.state?.trim() || null,
          country: values.country?.trim() || null,
          postcode: values.postcode?.trim() || null,
        },
        socials,
      },
      {
        onSuccess: () => {
          toast({ title: 'Organization updated' })
          onUserUpdated()
          setIsEditOrgDetailsOpen(false)
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
              this page to manage your profile and verification.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const pendingVerification =
    !user.isVerifiedByAdmin &&
    Boolean(org.verificationRequestedAt || org.verificationDocumentUrl)

  const orgSocials = formatSocialsFromUser(user.socials)

  return (
    <div className='container mx-auto space-y-6 p-6'>
      <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Organization profile
          </h1>
          <p className='text-muted-foreground'>
            Manage your organization branding on Nepal Climate Hub.
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
            onClick={() => setIsEditOrgDetailsOpen(true)}
          >
            <Edit className='mr-2 h-4 w-4' />
            Edit details
          </Button>
        </div>
      </div>

      <Card className='overflow-hidden border p-0 shadow-sm'>
        <h2 className='sr-only'>Your account</h2>
        <div className='border-b border-border/60 bg-muted/20 px-4 py-3 sm:px-6'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3'>
            <div className='flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1.5 text-sm sm:flex-nowrap sm:overflow-x-auto sm:whitespace-nowrap sm:[scrollbar-width:thin]'>
              <Building2
                className='h-4 w-4 shrink-0 text-muted-foreground'
                aria-hidden
              />
              <span className='font-semibold text-foreground'>{org.name}</span>
              <span className='text-muted-foreground' aria-hidden>
                ·
              </span>

              {user.isVerifiedByAdmin ? (
                <Badge
                  variant='default'
                  className='shrink-0 bg-emerald-600 hover:bg-emerald-600'
                >
                  <CheckCircle2 className='mr-1 h-3 w-3' />
                  Verified organization
                </Badge>
              ) : pendingVerification ? (
                <Badge variant='secondary' className='shrink-0'>
                  <Clock className='mr-1 h-3 w-3' />
                  Verification pending review
                </Badge>
              ) : (
                <Badge variant='outline' className='shrink-0'>
                  Not verified
                </Badge>
              )}
            </div>
            <div className='flex shrink-0 flex-wrap items-center justify-end gap-2'>
              {!user.isVerifiedByAdmin &&
                (pendingVerification ? (
                  <Button
                    type='button'
                    size='sm'
                    variant='secondary'
                    onClick={() => setIsViewApplicationOpen(true)}
                  >
                    <ClipboardList className='mr-2 h-3.5 w-3.5' />
                    View application
                  </Button>
                ) : (
                  <Button
                    type='button'
                    size='sm'
                    variant='secondary'
                    onClick={() => setIsVerifyDialogOpen(true)}
                  >
                    Verify organization
                  </Button>
                ))}
            </div>
          </div>
        </div>
        {/* Cover — LinkedIn-style header */}
        <div className='relative h-[min(28vw,200px)] min-h-[140px] w-full sm:min-h-[160px]'>
          <div
            className={cn(
              'absolute inset-0',
              bannerUrl
                ? 'bg-cover bg-center bg-no-repeat'
                : 'bg-gradient-to-br from-slate-200 via-sky-100/80 to-slate-300/90'
            )}
            style={
              bannerUrl ? { backgroundImage: `url(${bannerUrl})` } : undefined
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
                    src={nullableString(user.profilePhotoUrl) ?? undefined}
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
                  onClick={() => setIsEditProfilePhotoOpen(true)}
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
            <p className='text-xs text-muted-foreground'>
              How your organization appears on Nepal Climate Hub.
            </p>
            <div>
              <h4 className='text-sm font-medium text-muted-foreground'>
                Description
              </h4>
              <p className='whitespace-pre-wrap text-foreground'>
                {org.description || '—'}
              </p>
            </div>
            <div className='flex items-start gap-2'>
              <Tags className='mt-0.5 h-4 w-4 shrink-0 text-muted-foreground' />
              <div>
                <h4 className='text-sm font-medium text-muted-foreground'>
                  Type
                </h4>
                <p className='text-foreground'>
                  {org.organizationType?.trim() || '—'}
                </p>
              </div>
            </div>
            <div className='flex items-start gap-2'>
              <MapPin className='mt-0.5 h-4 w-4 shrink-0 text-muted-foreground' />
              <div>
                <h4 className='text-sm font-medium text-muted-foreground'>
                  Location
                </h4>
                <p className='text-foreground'>{formatLocation(org)}</p>
              </div>
            </div>
            <div className='flex items-start gap-2'>
              <Share2 className='mt-0.5 h-4 w-4 shrink-0 text-muted-foreground' />
              <div className='min-w-0 flex-1'>
                <h4 className='text-sm font-medium text-muted-foreground'>
                  Socials
                </h4>
                <ul className='mt-1 space-y-1 text-sm'>
                  {(
                    [
                      ['Facebook', orgSocials.facebook],
                      ['Instagram', orgSocials.instagram],
                      ['LinkedIn', orgSocials.linkedin],
                    ] as const
                  ).map(([label, url]) => (
                    <li key={label}>
                      <span className='text-muted-foreground'>{label}: </span>
                      {url ? (
                        <a
                          href={url}
                          target='_blank'
                          rel='noreferrer'
                          className='break-all text-primary underline-offset-2 hover:underline'
                        >
                          {url}
                        </a>
                      ) : (
                        <span className='text-muted-foreground'>—</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className='grid gap-3 border-t border-border/60 pt-4 md:grid-cols-2'>
            <div className='flex items-center gap-2 text-sm'>
              <Mail className='h-4 w-4 shrink-0 text-muted-foreground' />
              <span className='font-medium'>Email</span>
              <span className='truncate text-muted-foreground'>
                {user.email}
              </span>
            </div>
            <div className='flex items-center gap-2 text-sm'>
              <CalendarDays className='h-4 w-4 shrink-0 text-muted-foreground' />
              <span className='font-medium'>Member since</span>
              <span className='text-muted-foreground'>
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={isEditOrgDetailsOpen}
        onOpenChange={setIsEditOrgDetailsOpen}
      >
        <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Edit organization information</DialogTitle>
            <DialogDescription>
              Update how your organization appears on Nepal Climate Hub.
            </DialogDescription>
          </DialogHeader>
          <Form {...orgForm}>
            <form
              onSubmit={orgForm.handleSubmit(onSubmitOrgDetails)}
              className='space-y-4'
            >
              <FormField
                control={orgForm.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={orgForm.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea className='min-h-[120px] resize-y' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={orgForm.control}
                name='organizationType'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g. NGO, network, private sector'
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='grid gap-3 sm:grid-cols-2'>
                <FormField
                  control={orgForm.control}
                  name='street'
                  render={({ field }) => (
                    <FormItem className='sm:col-span-2'>
                      <FormLabel>Street / line 1</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={orgForm.control}
                  name='city'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={orgForm.control}
                  name='state'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State / province</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={orgForm.control}
                  name='postcode'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal code</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={orgForm.control}
                  name='country'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className='space-y-3 border-t pt-4'>
                <p className='text-sm font-medium'>Social links</p>
                <FormField
                  control={orgForm.control}
                  name='facebook'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facebook</FormLabel>
                      <FormControl>
                        <Input
                          type='url'
                          placeholder='https://…'
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={orgForm.control}
                  name='instagram'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram</FormLabel>
                      <FormControl>
                        <Input
                          type='url'
                          placeholder='https://…'
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={orgForm.control}
                  name='linkedin'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn</FormLabel>
                      <FormControl>
                        <Input
                          type='url'
                          placeholder='https://…'
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setIsEditOrgDetailsOpen(false)}
                >
                  Cancel
                </Button>
                <Button type='submit' disabled={patchOrg.isPending}>
                  {patchOrg.isPending ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Saving…
                    </>
                  ) : (
                    'Save'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

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
              key={`${isEditCoverOpen}-${bannerUrl ?? 'none'}`}
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
            <Button
              type='button'
              onClick={handleSaveCover}
              disabled={patchOrg.isPending}
            >
              {patchOrg.isPending ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Saving…
                </>
              ) : (
                'Save cover'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ChangePasswordDialog
        open={isChangePasswordDialogOpen}
        onOpenChange={setIsChangePasswordDialogOpen}
      />
      <EditProfilePhotoDialog
        open={isEditProfilePhotoOpen}
        onOpenChange={setIsEditProfilePhotoOpen}
        onPhotoUpdated={() => onUserUpdated()}
      />
      <OrganizationVerifyDialog
        open={isVerifyDialogOpen}
        onOpenChange={setIsVerifyDialogOpen}
        organization={mapOrganizationProfileDto(org)!}
        onSubmitted={() => onUserUpdated()}
      />
      <OrganizationVerificationViewDialog
        open={isViewApplicationOpen}
        onOpenChange={setIsViewApplicationOpen}
        organization={mapOrganizationProfileDto(org)!}
      />
    </div>
  )
}
