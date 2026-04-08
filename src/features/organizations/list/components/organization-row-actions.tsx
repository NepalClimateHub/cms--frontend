import { FC } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Row } from '@tanstack/react-table'
import { IconCheck, IconEdit, IconTrash } from '@tabler/icons-react'
import apiClient from '@/query/apiClient'
import { OrganizationFormValues as Organization } from '@/schemas/organization/organization'
import { getRoleFromToken } from '@/utils/jwt.util'
import { isVerificationAdmin } from '@/utils/role-check.util'
import { useToast } from '@/hooks/use-toast'

type OrganizationRowActionProps = {
  row: Row<Organization>
}

const OrganizationRowAction: FC<OrganizationRowActionProps> = ({ row }) => {
  const role = getRoleFromToken()
  const canVerify = isVerificationAdmin(role)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const handleEdit = () => {
    // navigate({
    //     to: '/Tags/$roleId',
    //     params: {
    //         roleId: row.original.id
    //     }
    // })
  }

  const handleVerify = async () => {
    const orgId = (row.original as any)?.id
    if (!orgId) return
    try {
      await apiClient.patch(`/api/v1/organizations/${orgId}/verify`, {
        isVerified: true,
      })
      toast({
        title: 'Organization verified',
        description: 'The organization is now marked as verified.',
      })
      queryClient.invalidateQueries({
        queryKey: ['organizationControllerGetOrgs'],
      })
    } catch (_e) {
      toast({
        title: 'Verification failed',
        description: 'Could not verify this organization.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className='flex items-center justify-center gap-4'>
      {canVerify && !(row.original as any)?.isVerifiedByAdmin && (
        <IconCheck
          onClick={handleVerify}
          className='cursor-pointer text-green-600'
          size={16}
        />
      )}
      <IconEdit onClick={handleEdit} className='cursor-pointer' size={16} />
      <IconTrash className='cursor-pointer' size={16} />
    </div>
  )
}

export default OrganizationRowAction
