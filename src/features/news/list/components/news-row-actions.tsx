import { FC } from 'react'
import { Row } from '@tanstack/react-table'
import { IconEdit, IconTrash } from '@tabler/icons-react'
import { useDeleteNews } from '@/query/news/use-news'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogContent,
} from '@/components/ui/dialog'
import { NewsWithId } from '@/schemas/news/news'

type NewsRowActionProps = {
  row: Row<NewsWithId>
}

const NewsRowAction: FC<NewsRowActionProps> = ({ row }) => {

  const { mutate: deleteNewsMutation } = useDeleteNews()

  return (
    <div className='flex items-center justify-center gap-4'>
      <IconEdit onClick={() => {}} className='cursor-pointer' size={16} />

      <Dialog>
        <DialogTrigger>
          <IconTrash className='cursor-pointer' size={16} />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </DialogDescription>
          </DialogHeader>

          <Button
            type='submit'
            onClick={() => {
              deleteNewsMutation({
                path: {
                  id: row.original.id,
                },
              })
            }}
          >
            Confirm
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default NewsRowAction
