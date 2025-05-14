import { FC } from 'react'
import { Row } from '@tanstack/react-table'
import { IconEdit, IconTrash } from '@tabler/icons-react'
import Tags from '@/schemas/tags/tags'

type TagsRowActionProps = {
  row: Row<Tags>
}

const TagsRowAction: FC<TagsRowActionProps> = ({ row: _row }) => {
  const handleEdit = () => {
    // TODO: Implement edit functionality
    // - Add navigation to edit page
    // - Pass tag ID as parameter
  }

  const handleDelete = () => {
    // TODO: Implement delete functionality
    // - Add confirmation dialog
    // - Call delete API
    // - Show success/error toast
  }

  return (
    <div className='flex items-center justify-center gap-4'>
      <IconEdit onClick={handleEdit} className='cursor-pointer' size={16} />
      <IconTrash onClick={handleDelete} className='cursor-pointer' size={16} />
    </div>
  )
}

export default TagsRowAction
