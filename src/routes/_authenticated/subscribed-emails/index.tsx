import React, { Suspense, useState } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import {
  emailSubscriptionControllerFindAll,
  emailSubscriptionControllerRemove,
} from '@/api'
import { ConfirmDialog } from '@/ui/confirm-dialog'
import { Avatar, AvatarFallback } from '@/ui/shadcn/avatar'
import { cn } from '@/ui/shadcn/lib/utils'
import { X } from 'lucide-react'
import { handleServerError } from '@/utils/handle-server-error'
import { useToast } from '@/hooks/use-toast'
import { getRoleFromToken } from '@/utils/jwt.util'

export const Route = createFileRoute('/_authenticated/subscribed-emails/')({
  beforeLoad: () => {
    const role = getRoleFromToken()
    if (role !== 'ADMIN') {
      throw redirect({
        to: '/',
      })
    }
  },
  component: SubscribedEmailsPage,
})

export default function SubscribedEmailsPage() {
  return (
    <div className='p-6'>
      <h1 className='mb-4 text-xl font-semibold'>Subscribed Emails</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <SubscribedEmailsList />
      </Suspense>
    </div>
  )
}

function SubscribedEmailsList() {
  const [emails, setEmails] = React.useState<
    Array<{ id?: string; email?: string }>
  >([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchEmails = React.useCallback(() => {
    emailSubscriptionControllerFindAll()
      .then((res) => {
        const data =
          res &&
          typeof res === 'object' &&
          'data' in res &&
          Array.isArray((res as unknown as { data: unknown }).data)
            ? (res as { data: Array<{ id?: string; email?: string }> }).data
            : []
        setEmails(data)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load emails')
        setLoading(false)
      })
  }, [])

  React.useEffect(() => {
    fetchEmails()
  }, [fetchEmails])

  if (loading) return <div>Loading...</div>
  if (error) return <div className='text-red-500'>{error}</div>
  if (!emails.length) return <div>No subscribed emails found.</div>

  return (
    <div className='flex flex-wrap gap-3'>
      {emails.map((item, idx) => (
        <EmailBadge
          key={item.id || idx}
          email={item}
          onDelete={() => fetchEmails()}
        />
      ))}
    </div>
  )
}

function EmailBadge({
  email,
  onDelete,
}: {
  email: { id?: string; email?: string }
  onDelete: () => void
}) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Get initials from email (first letter before @)
  const getEmailInitials = (emailStr: string | undefined) => {
    if (!emailStr) return 'XO'
    const part = emailStr.split('@')[0]
    if (part.length === 0) return 'XO'
    if (part.length === 1) return part[0].toUpperCase()
    return (part[0] + part[part.length - 1]).toUpperCase()
  }

  const handleDelete = async () => {
    if (!email.id) {
      toast({
        title: 'Error',
        description: 'Email ID is missing',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      await emailSubscriptionControllerRemove({
        path: {
          id: email.id,
        },
      })
      toast({
        title: 'Success',
        description: 'Email subscription removed successfully',
      })
      setOpen(false)
      onDelete()
    } catch (error) {
      handleServerError(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className='flex items-center gap-2 rounded-lg border bg-background px-3 py-2 shadow-sm transition-shadow hover:shadow-md'>
        <Avatar className='h-8 w-8'>
          <AvatarFallback className='bg-primary/10 text-xs font-medium text-primary'>
            {getEmailInitials(email.email)}
          </AvatarFallback>
        </Avatar>
        <span className='text-sm font-medium text-foreground'>
          {email.email || '-'}
        </span>
        <button
          onClick={() => setOpen(true)}
          disabled={isLoading}
          className={cn(
            'ml-1 flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive',
            isLoading && 'cursor-not-allowed opacity-50'
          )}
        >
          <X size={14} />
        </button>
      </div>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title='Delete Email Subscription'
        desc={`Are you sure you want to remove the subscription for ${email.email}? This action cannot be undone.`}
        confirmText='Delete'
        destructive
        isLoading={isLoading}
        handleConfirm={handleDelete}
      />
    </>
  )
}
