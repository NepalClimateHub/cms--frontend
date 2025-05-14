import { FC } from 'react'
import { Row } from '@tanstack/react-table'
import { useDeleteNews } from '@/query/news/use-news'
import { LucideEye, Pencil, Trash } from 'lucide-react'
import { NewsResponseDto } from '@/api/types.gen'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogContent,
} from '@/components/ui/dialog'

type NewsRowActionProps = {
  row: Row<NewsResponseDto>
}

const NewsRowAction: FC<NewsRowActionProps> = ({ row }) => {
  const { mutate: deleteNewsMutation } = useDeleteNews()

  return (
    <div className='flex items-center justify-center gap-4'>
      <Dialog>
        <DialogTrigger>
          <Button
            size={'sm'}
            variant={'default'}
            className='h-6 bg-green-500 px-2'
          >
            <LucideEye />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>News Details</DialogTitle>
            <DialogDescription>
              <div>
                <h1>{row.original.title}</h1>
                <p>{row.original.source}</p>
                <p>{row.original.mode}</p>
                <p>{row.original.newsLink}</p>
                <p>{row.original.publishedDate}</p>
                <p>{row.original.publishedYear}</p>
                <p>{row.original.contributedBy}</p>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Button
        onClick={() => {}}
        size={'sm'}
        variant={'default'}
        className='h-6 bg-blue-500 px-2'
      >
        <Pencil />
      </Button>

      <Dialog>
        <DialogTrigger>
          <Button size={'sm'} variant={'destructive'} className='h-6 px-2'>
            <Trash />
          </Button>
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
