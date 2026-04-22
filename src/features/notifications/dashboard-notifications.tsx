'use client'

import { format } from 'date-fns'
import { Link } from '@tanstack/react-router'
import {
  useMarkNotificationRead,
  useNotificationsQuery,
} from '@/query/notifications/use-notifications'
import { Badge } from '@/ui/shadcn/badge'
import { Button } from '@/ui/shadcn/button'
import { cn } from '@/ui/shadcn/lib/utils'
import { ScrollArea } from '@/ui/shadcn/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/ui/shadcn/sheet'
import { Bell } from 'lucide-react'
import { getRoleFromToken } from '@/utils/jwt.util'

export function HeaderNotifications() {
  const role = getRoleFromToken()
  const show = role === 'INDIVIDUAL' || role === 'ORGANIZATION'

  const { data, isLoading } = useNotificationsQuery(show)
  const markRead = useMarkNotificationRead()

  if (!show) {
    return null
  }

  const items = data?.data ?? []
  const unread = data?.meta?.unreadCount ?? 0

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='relative scale-95 rounded-full'
        >
          <Bell className='size-[1.2rem]' />
          <span className='sr-only'>Notifications</span>
          {unread > 0 ? (
            <Badge
              variant='default'
              className='absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] tabular-nums'
            >
              {unread > 99 ? '99+' : unread}
            </Badge>
          ) : null}
        </Button>
      </SheetTrigger>
      <SheetContent className='flex w-full flex-col sm:max-w-md'>
        <SheetHeader>
          <SheetTitle>Your notifications</SheetTitle>
        </SheetHeader>
        {isLoading ? (
          <p className='text-sm text-muted-foreground'>Loading…</p>
        ) : items.length === 0 ? (
          <p className='text-sm text-muted-foreground'>No notifications yet.</p>
        ) : (
          <ScrollArea className='-mr-2 mt-4 flex-1 pr-3'>
            <ul className='space-y-3'>
              {items.map((n) => (
                <li
                  key={n.id}
                  className={cn(
                    'rounded-lg border p-3 text-sm transition-colors',
                    !n.read && 'border-primary/30 bg-muted/40'
                  )}
                >
                  <div className='flex items-start justify-between gap-2'>
                    <div className='min-w-0 flex-1'>
                      <p className='font-medium leading-snug'>{n.title}</p>
                      {n.body ? (
                        <p className='mt-1 text-muted-foreground'>{n.body}</p>
                      ) : null}
                      <p className='mt-2 text-xs text-muted-foreground'>
                        {format(new Date(n.createdAt), 'PPp')}
                      </p>
                    </div>
                    {!n.read ? (
                      <Badge variant='secondary' className='shrink-0'>
                        New
                      </Badge>
                    ) : null}
                  </div>
                  <div className='mt-3 flex flex-wrap gap-2'>
                    {n.entityType === 'BLOG' && n.entityId ? (
                      <>
                        <Button variant='outline' size='sm' asChild>
                          <Link
                            to='/blogs/$blogId'
                            params={{ blogId: n.entityId }}
                            onClick={() => {
                              if (!n.read) {
                                markRead.mutate(n.id)
                              }
                            }}
                          >
                            Open blog
                          </Link>
                        </Button>
                        {!n.read ? (
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => markRead.mutate(n.id)}
                            disabled={markRead.isPending}
                          >
                            Mark read
                          </Button>
                        ) : null}
                      </>
                    ) : n.entityType === 'ORGANIZATION' ? (
                      <>
                        <Button variant='outline' size='sm' asChild>
                          <Link
                            to='/dashboard/profile'
                            onClick={() => {
                              if (!n.read) {
                                markRead.mutate(n.id)
                              }
                            }}
                          >
                            View profile
                          </Link>
                        </Button>
                        {!n.read ? (
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => markRead.mutate(n.id)}
                            disabled={markRead.isPending}
                          >
                            Mark read
                          </Button>
                        ) : null}
                      </>
                    ) : !n.read ? (
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => markRead.mutate(n.id)}
                        disabled={markRead.isPending}
                      >
                        Mark read
                      </Button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  )
}
