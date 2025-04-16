import { FC } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Row } from '@tanstack/react-table'
import { IconEdit, IconTrash } from '@tabler/icons-react'
import Tags from '@/schemas/tags/tags'

type OrganizationRowActionProps = {
  row: Row<Organization>
}

const OrganizationRowAction: FC<OrganizationRowActionProps> = ({ row }) => {
  const navigate = useNavigate()
  const handleEdit = () => {
    console.log('ok')
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
