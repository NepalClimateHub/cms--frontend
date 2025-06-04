import { Row } from '@tanstack/react-table'
import Tags from '@/schemas/tags/tags'
// import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FC } from 'react'
// import { useToast } from '@/hooks/use-toast'
// import { deleteTagById } from '@/query/use-tags';
// import { handleServerError } from '@/utils/handle-server-error'
// import { Pencil, Trash } from 'lucide-react';

type TagsRowActionProps = {
  row: Row<Tags>
}

const TagsRowAction: FC<TagsRowActionProps> = ({ row: _row }) => {
  // const { toast } = useToast()
  // const queryClient = useQueryClient()

  // const { mutate: deleteTag } = useMutation({
  //   mutationFn: () => deleteTagById(_row.original.id),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['tags'] })
  //     toast({
  //       title: 'Success',
  //       description: 'Tag deleted successfully',
  //     })
  //   },
  //   onError: (error) => {
  //     handleServerError(error)
  //   },
  // })

  // const handleEdit = () => {
    // TODO: Implement edit functionality
    // - Add navigation to edit page
    // - Pass tag ID as parameter
  // }

  // const handleDelete = () => {
    // TODO: Implement delete functionality
    // - Add confirmation dialog
    // - Call delete API
    // - Show success/error toast
  // }

  return (
    <div className='flex items-center justify-center gap-4'>
      {/* <Pencil onClick={handleEdit} className='cursor-pointer' size={16} />
      <Trash onClick={handleDelete} className='cursor-pointer' size={16} /> */}
    </div>
  )
}

export default TagsRowAction
