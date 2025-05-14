import { FC } from 'react'
import { Row } from '@tanstack/react-table'
import { IconEdit, IconTrash } from '@tabler/icons-react'
import { OrganizationFormValues as Organization } from '@/schemas/organization/organization'

type OrganizationRowActionProps = {
  row: Row<Organization>
}

const OrganizationRowAction: FC<OrganizationRowActionProps> = () => {
  const handleEdit = () => {
    // navigate({
    //     to: '/Tags/$roleId',
    //     params: {
    //         roleId: row.original.id
    //     }
    // })
  }

  return (
    <div className='flex items-center justify-center gap-4'>
      <IconEdit onClick={handleEdit} className='cursor-pointer' size={16} />
      <IconTrash className='cursor-pointer' size={16} />
    </div>
  )
}

export default OrganizationRowAction
