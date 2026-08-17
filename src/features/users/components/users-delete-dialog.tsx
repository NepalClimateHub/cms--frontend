'use client'

import { useState } from 'react'
import { IconAlertTriangle } from '@tabler/icons-react'
import { useDeleteUser } from '@/query/users/use-users'
import { Alert, AlertDescription, AlertTitle } from '@/ui/shadcn/alert'
import { Input } from '@/ui/shadcn/input'
import { Label } from '@/ui/shadcn/label'
import { toast } from '@/hooks/use-toast'
import { ConfirmDialog } from '@/ui/confirm-dialog'
import { User } from '../data/schema'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: User
}

export function UsersDeleteDialog({ open, onOpenChange, currentRow }: Props) {
  const [value, setValue] = useState('')
  const deleteUserMutation = useDeleteUser()

  const displayName =
    currentRow.organization?.name ||
    `${currentRow.firstName} ${currentRow.lastName}`.trim() ||
    currentRow.email

  const isConfirmed =
    value.trim().toLowerCase() === currentRow.username.toLowerCase() ||
    value.trim().toLowerCase() === currentRow.email.toLowerCase() ||
    value.trim().toLowerCase() === displayName.toLowerCase()

  const handleDelete = () => {
    if (!isConfirmed) return

    deleteUserMutation.mutate(currentRow.id, {
      onSuccess: () => {
        onOpenChange(false)
        setValue('')
        toast({
          title: 'User deleted successfully',
          description: `${displayName} (${currentRow.email}) has been permanently deleted.`,
        })
      },
      onError: (err: any) => {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          'Failed to delete user.'
        toast({
          title: 'Error deleting user',
          description: message,
          variant: 'destructive',
        })
      },
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) setValue('')
        onOpenChange(isOpen)
      }}
      handleConfirm={handleDelete}
      disabled={!isConfirmed || deleteUserMutation.isPending}
      isLoading={deleteUserMutation.isPending}
      title={
        <span className='text-destructive'>
          <IconAlertTriangle
            className='mr-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          Delete User
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Are you sure you want to delete{' '}
            <span className='font-bold'>{displayName}</span> ({currentRow.email})?
            <br />
            This action will permanently remove the user with the role of{' '}
            <span className='font-bold'>
              {currentRow.serverRole}
            </span>{' '}
            and any linked organization details from the system. This action cannot be undone.
          </p>

          <Label className='my-2'>
            Type <span className='font-semibold'>{currentRow.username}</span> or <span className='font-semibold'>{currentRow.email}</span> to confirm:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Enter username or email to confirm deletion.'
              disabled={deleteUserMutation.isPending}
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              Please be careful, this operation cannot be rolled back.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText={deleteUserMutation.isPending ? 'Deleting...' : 'Delete'}
      destructive
    />
  )
}
