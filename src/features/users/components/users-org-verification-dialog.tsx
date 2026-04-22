import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import apiClient from '@/query/apiClient'
import OrganizationVerificationViewDialog from '@/ui/organisms/dashboard/organization-verification-view-dialog'
import { Button } from '@/ui/shadcn/button'
import { DialogFooter } from '@/ui/shadcn/dialog'
import { useToast } from '@/hooks/use-toast'
import { getRoleFromToken } from '@/utils/jwt.util'
import { isVerificationAdmin } from '@/utils/role-check.util'
import { Loader2 } from 'lucide-react'
import type { User } from '../data/schema'

type Props = {
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function toOrgProfile(user: User) {
  const org = user.organization
  if (!org) return null
  return {
    id: org.id,
    name: org.name,
    logoImageUrl: org.logoImageUrl ?? '',
    logoImageId: org.logoImageId ?? null,
    verificationDocumentUrl: org.verificationDocumentUrl ?? null,
    verificationDocumentId: org.verificationDocumentId ?? null,
    verificationRequestRemarks: org.verificationRequestRemarks ?? null,
    verificationRequestedAt: org.verificationRequestedAt ?? null,
  }
}

export function UsersOrgVerificationDialog({
  user,
  open,
  onOpenChange,
}: Props) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [isVerifying, setIsVerifying] = useState(false)
  const role = getRoleFromToken()
  const canVerify = isVerificationAdmin(role)
  const orgProfile = user ? toOrgProfile(user) : null
  const orgId = orgProfile?.id
  const showVerify = Boolean(
    canVerify && orgProfile && user && !user.isVerifiedByAdmin
  )

  const handleVerify = async () => {
    if (!orgId) return
    setIsVerifying(true)
    try {
      await apiClient.patch(`/api/v1/organizations/${orgId}/verify`, {
        isVerified: true,
      })
      toast({
        title: 'Organization verified',
        description: 'The organization is now marked as verified.',
      })
      await queryClient.invalidateQueries({
        predicate: (q) => q.queryKey[0] === 'userControllerGetUsers',
      })
      await queryClient.invalidateQueries({
        predicate: (q) =>
          q.queryKey[0] === 'analyticsControllerGetAdminAnalytics',
      })
      onOpenChange(false)
    } catch {
      toast({
        title: 'Verification failed',
        description: 'Could not verify this organization.',
        variant: 'destructive',
      })
    } finally {
      setIsVerifying(false)
    }
  }

  if (!orgProfile) {
    return null
  }

  return (
    <OrganizationVerificationViewDialog
      open={open}
      onOpenChange={onOpenChange}
      organization={orgProfile}
      adminView
      footer={
        showVerify ? (
          <DialogFooter className='gap-2 sm:justify-end'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button
              type='button'
              onClick={handleVerify}
              disabled={isVerifying}
            >
              {isVerifying ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Verifying…
                </>
              ) : (
                'Verify organization'
              )}
            </Button>
          </DialogFooter>
        ) : null
      }
    />
  )
}
