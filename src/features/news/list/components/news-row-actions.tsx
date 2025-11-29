import { FC } from 'react'
import { format } from 'date-fns'
import { useNavigate } from '@tanstack/react-router'
import { Row } from '@tanstack/react-table'
import { useNewsAPI } from '@/query/news/use-news'
import { Button } from '@/ui/shadcn/button'
import {
  Dialog,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogContent,
  DialogFooter,
} from '@/ui/shadcn/dialog'
import {
  LucideEye,
  Pencil,
  Trash,
  ExternalLink,
  Calendar,
  User,
  Newspaper,
} from 'lucide-react'
import { NewsResponseDto } from '@/api/types.gen'

type NewsRowActionProps = {
  row: Row<NewsResponseDto>
}

const NewsRowAction: FC<NewsRowActionProps> = ({ row }) => {
  const { mutate: deleteNewsMutation } = useNewsAPI().deleteNews
  const { mutate: updateNewsMutation } = useNewsAPI().updateNews

  const navigate = useNavigate()

  const handleEditNews = (newsId: string) => {
    navigate({
      to: `/news/${newsId}`,
    })
  }

  const handleStatusToggle = (newsId: string, isDraft: boolean) => {
    updateNewsMutation({
      path: {
        id: newsId,
      },
      // @ts-ignore
      body: {
        isDraft: isDraft ? true : false,
      },
    })
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM dd, yyyy')
    } catch (_error) {
      return dateString
    }
  }

  return (
    <div className='flex items-center justify-end gap-2'>
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
            <DialogTitle className='text-2xl font-bold text-gray-900'>
              News Details
            </DialogTitle>
          </DialogHeader>

          <div className='mt-6 space-y-6'>
            {/* Title Section */}
            <div className='space-y-2'>
              <h2 className='text-xl font-semibold text-gray-900'>
                {row.original.title}
              </h2>
              <div className='flex items-center gap-2 text-sm text-gray-500'>
                <Newspaper className='h-4 w-4' />
                <span>{row.original.source}</span>
                <span>•</span>
                <span className='capitalize'>{row.original.mode}</span>
              </div>
            </div>

            {/* Tags */}
            {row.original.tags && row.original.tags.length > 0 && (
              <div className='flex flex-wrap gap-2'>
                {/* @ts-ignore */}
                {row.original?.tags?.map((t: { tag: string }) => (
                  <span
                    key={t.tag}
                    className='rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800'
                  >
                    {t.tag}
                  </span>
                ))}
              </div>
            )}

            {/* Publication Details */}
            <div className='grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4'>
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm text-gray-600'>
                  <Calendar className='h-4 w-4' />
                  <span>Published Date:</span>
                </div>
                <p className='text-sm font-medium text-gray-900'>
                  {formatDate(row.original.publishedDate)}
                </p>
              </div>
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm text-gray-600'>
                  <User className='h-4 w-4' />
                  <span>Contributed By:</span>
                </div>
                <p className='text-sm font-medium text-gray-900'>
                  {row.original.contributedBy}
                </p>
              </div>
            </div>

            {/* News Link */}
            <div className='space-y-2'>
              <div className='flex items-center gap-2 text-sm text-gray-600'>
                <ExternalLink className='h-4 w-4' />
                <span>News Link:</span>
              </div>
              <a
                href={row.original.newsLink}
                target='_blank'
                rel='noopener noreferrer'
                className='text-sm text-blue-600 hover:text-blue-800 hover:underline'
              >
                {row.original.newsLink}
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* status trigger */}
      <Button
        onClick={() =>
          handleStatusToggle(row.original.id, !row.original.isDraft)
        }
        size={'sm'}
        className='h-6 bg-blue-500 px-2'
      >
        {row.original.isDraft ? 'Publish' : 'Conceal'}
      </Button>

      <Button
        onClick={() => handleEditNews(row.original.id)}
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
            <DialogTitle>Delete News</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this news? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type='submit'
              variant='destructive'
              onClick={() => {
                deleteNewsMutation({
                  path: {
                    id: row.original.id,
                  },
                })
              }}
            >
              Delete News
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default NewsRowAction
