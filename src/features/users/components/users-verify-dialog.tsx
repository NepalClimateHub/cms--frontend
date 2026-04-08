import { useVerifyUserByAdmin } from '@/query/users/use-users'
import { ConfirmDialog } from '@/ui/confirm-dialog'
import { useToast } from '@/hooks/use-toast'
import { User } from '../data/schema'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: User
}

export function UsersVerifyDialog({ open, onOpenChange, currentRow }: Props) {
  const { toast } = useToast()
  const verifyMutation = useVerifyUserByAdmin()

  const handleVerify = async () => {
    try {
      await verifyMutation.mutateAsync({
        id: currentRow.id,
        isVerified: true,
      })
      toast({
        title: 'User verified',
        description: `${currentRow.email} has been verified.`,
      })
      onOpenChange(false)
    } catch (_e) {
      toast({
        title: 'Verification failed',
        description: 'Could not verify this user. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Verify User'
      desc={`Are you sure you want to verify ${currentRow.email}?`}
      confirmText='Verify'
      isLoading={verifyMutation.isPending}
      handleConfirm={handleVerify}
    />
  )
}
