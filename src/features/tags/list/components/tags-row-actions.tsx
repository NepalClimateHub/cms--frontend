// import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FC, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Row } from '@tanstack/react-table'
import { useTagsAPI } from '@/query/tags/use-tags'
import Tags from '@/schemas/tags/tags'
import { Pencil, Trash } from 'lucide-react'
import { handleServerError } from '@/utils/handle-server-error'
import { useToast } from '@/hooks/use-toast'
import { ConfirmDialog } from '@/components/confirm-dialog'

// import { useToast } from '@/hooks/use-toast'
// import { deleteTagById } from '@/query/use-tags';
// import { handleServerError } from '@/utils/handle-server-error'
// import { Pencil, Trash } from 'lucide-react';

type TagsRowActionProps = {
  row: Row<Tags>
}

const TagsRowAction: FC<TagsRowActionProps> = ({ row: _row }) => {
  const { toast } = useToast()
  const deleteMutation = useTagsAPI().delete
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleEdit = () => {}

  const handleDelete = async () => {
    setIsLoading(true)
    deleteMutation.mutate(
      {
        path: {
          id: _row.original.id,
        },
      },
      {
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Tag deleted successfully',
      })
          setOpen(false)
    },
    onError: (error) => {
      handleServerError(error)
    },
        onSettled: () => {
          setIsLoading(false)
      },
      }
    )
  }

  return (
    <div className='flex items-center justify-center gap-4'>
      <Pencil onClick={handleEdit} className='cursor-pointer' size={16} />
      <span>
        <Trash
          onClick={() => setOpen(true)}
          className='cursor-pointer'
          size={16}
        />
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          title='Delete Tag'
          desc='Are you sure you want to delete this tag? This action cannot be undone.'
          confirmText='Delete'
          destructive
          isLoading={isLoading}
          handleConfirm={handleDelete}
        />
      </span>
    </div>
  )
}

export default TagsRowAction
