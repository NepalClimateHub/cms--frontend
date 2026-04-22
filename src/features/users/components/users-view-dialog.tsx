import type { ReactNode } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/shadcn/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/ui/shadcn/dialog'
import { getInitialsForAvatar } from '@/ui/shadcn/lib/utils'
import { Separator } from '@/ui/shadcn/separator'
import { callTypes, userTypeOptions } from '../data/data'
import { User } from '../data/schema'

type Props = {
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function serverRoleLabel(serverRole: User['serverRole']): string {
  if (serverRole === 'SUPER_ADMIN') {
    return 'Super Admin'
  }
  return (
    userTypeOptions.find((o) => o.value === serverRole)?.label ?? serverRole
  )
}

function DetailRow({
  label,
  value,
  children,
}: {
  label: string
  value?: string | null
  children?: ReactNode
}) {
  return (
    <div className='grid grid-cols-[9rem_1fr] gap-x-3 gap-y-1 text-sm sm:grid-cols-[11rem_1fr]'>
      <dt className='font-medium text-muted-foreground'>{label}</dt>
      <dd className='min-w-0 break-words text-foreground'>
        {children ?? (value != null && value !== '' ? value : '—')}
      </dd>
    </div>
  )
}

export function UsersViewDialog({ user, open, onOpenChange }: Props) {
  if (!user) return null

  const fullName = `${user.firstName} ${user.lastName}`.trim()
  const nameInitials = getInitialsForAvatar(fullName || 'User')
  const statusClass = callTypes.get(user.status) ?? ''
  const org = user.organization
  const profileUrl = user.profilePhotoUrl
  const bannerUrl = user.bannerImageUrl

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[min(90vh,720px)] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-lg'>
        <div className='flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden'>
          <div
            className='relative h-28 w-full shrink-0 overflow-hidden sm:h-32'
            role='img'
            aria-label='Profile banner'
          >
            {bannerUrl ? (
              <img
                src={bannerUrl}
                alt=''
                className='h-full w-full object-cover'
              />
            ) : (
              <div className='h-full w-full bg-gradient-to-br from-slate-200 via-slate-100 to-sky-100/80' />
            )}
            <div className='pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent' />
          </div>
          {/* Flow layout: avatar pulled up with -mt; stays in document flow (no clip from overflow on parent) */}
          <div className='relative z-10 -mt-10 px-5 sm:-mt-12'>
            <Avatar className='h-20 w-20 border-4 border-background bg-background text-lg shadow-md ring-1 ring-border sm:h-24 sm:w-24 sm:text-2xl'>
              <AvatarImage
                src={profileUrl || undefined}
                alt={fullName || user.email}
                className='object-cover'
              />
              <AvatarFallback className='text-lg sm:text-2xl'>
                {nameInitials}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className='space-y-3 px-5 pb-5 pt-3 text-left'>
            <DialogHeader className='space-y-1 text-left'></DialogHeader>
            <div className='space-y-3'>
              <DetailRow label='Name' value={fullName} />
              <DetailRow label='Username' value={user.username} />
              <DetailRow label='Email' value={user.email} />
              <DetailRow label='Phone' value={user.phoneNumber || null} />
              <DetailRow
                label='User type'
                value={serverRoleLabel(user.serverRole)}
              />
              <div className='grid grid-cols-[9rem_1fr] items-center gap-3 sm:grid-cols-[11rem_1fr]'>
                <dt className='font-medium text-muted-foreground'>Status</dt>
                <dd>
                  <span
                    className={`inline-flex rounded border px-2 py-0.5 text-xs capitalize ${statusClass}`}
                  >
                    {user.status}
                  </span>
                </dd>
              </div>
              <DetailRow
                label='Admin verified (org)'
                value={
                  user.serverRole !== 'ORGANIZATION'
                    ? 'N/A'
                    : org
                      ? user.isVerifiedByAdmin
                        ? 'Yes'
                        : 'No'
                      : '—'
                }
              />
              {user.serverRole === 'ORGANIZATION' && org ? (
                <DetailRow label='Organization' value={org.name} />
              ) : null}
              <Separator className='my-2' />
              <DetailRow
                label='Created'
                value={user.createdAt.toLocaleString()}
              />
              <DetailRow
                label='Updated'
                value={user.updatedAt.toLocaleString()}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
