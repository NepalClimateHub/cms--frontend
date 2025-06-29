import { useState } from 'react'
import { format } from 'date-fns'
import { useNavigate } from '@tanstack/react-router'
import { Row } from '@tanstack/react-table'
import { useDeleteBlog, useBlogAPI } from '@/query/blogs/use-blogs'
import { LucideEye, Pencil, Trash } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { ConfirmDialog } from '@/components/confirm-dialog'

interface BlogRowActionProps {
  row: Row<any>
}

const BlogRowAction = ({ row }: BlogRowActionProps) => {
  const { mutate: deleteBlogMutation } = useDeleteBlog()
  const { mutate: updateBlogMutation } = useBlogAPI().updateBlog
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleStatusToggle = (blogId: string, isDraft: boolean) => {
    updateBlogMutation({
      path: {
        id: blogId,
      },
      // @ts-ignore
      body: {
        isDraft: isDraft ? true : false,
      },
    })
  }

  const formatDate = (date: string | undefined) => {
    if (!date) return 'Not specified'
    return format(new Date(date), 'PPP')
  }

  const handleEditBlog = (blogId: string) => {
    navigate({
      to: `/blogs/${blogId}`,
    })
  }

  const handleDelete = () => {
    setIsLoading(true)
    deleteBlogMutation(
      {
        path: {
          id: row.original.id,
        },
      },
      {
        onSettled: () => {
          setIsLoading(false)
          setOpen(false)
        },
      }
    )
  }

  return (
    <div className='flex items-center justify-center gap-4'>
      <Dialog>
        <DialogTrigger>
          <Button
            size={'sm'}
            variant={'default'}
            className='h-6 bg-green-500 px-2 hover:bg-green-600'
          >
            <LucideEye className='h-4 w-4' />
          </Button>
        </DialogTrigger>
        <DialogContent className='max-w-3xl'>
          <DialogHeader>
            <DialogTitle className='text-2xl font-bold'>
              {row.original.title}
            </DialogTitle>
            <DialogDescription className='space-y-6'>
              {/* Header Section */}
              <div className='flex items-center gap-2'>
                <Badge variant='outline' className='text-sm'>
                  {row.original.category}
                </Badge>
                <Badge
                  variant={row.original.isDraft ? 'secondary' : 'default'}
                  className='text-sm'
                >
                  {row.original.isDraft ? 'Draft' : 'Published'}
                </Badge>
              </div>

              {/* Author Section */}
              <div>
                <h3 className='text-sm font-semibold text-muted-foreground'>
                  Author
                </h3>
                <p className='text-base'>{row.original.author}</p>
              </div>

              {/* Content Section */}
              <div>
                <h3 className='text-sm font-semibold text-muted-foreground'>
                  Content
                </h3>
                <div
                  className='prose prose-sm mt-2 max-w-none text-base'
                  dangerouslySetInnerHTML={{ __html: row.original.content }}
                />
              </div>

              <Separator />

              {/* Details Grid */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <h3 className='text-sm font-semibold text-muted-foreground'>
                    Category
                  </h3>
                  <p className='text-base'>{row.original.category}</p>
                </div>
                <div>
                  <h3 className='text-sm font-semibold text-muted-foreground'>
                    Reading Time
                  </h3>
                  <p className='text-base'>
                    {row.original.readingTime || 'Not specified'}
                  </p>
                </div>
                <div>
                  <h3 className='text-sm font-semibold text-muted-foreground'>
                    Published Date
                  </h3>
                  <p className='text-base'>
                    {formatDate(row.original.publishedDate)}
                  </p>
                </div>
                <div>
                  <h3 className='text-sm font-semibold text-muted-foreground'>
                    Featured
                  </h3>
                  <p className='text-base'>
                    {row.original.isFeatured ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>

              {/* Excerpt Section */}
              {row.original.excerpt && (
                <>
                  <Separator />
                  <div>
                    <h3 className='text-sm font-semibold text-muted-foreground'>
                      Excerpt
                    </h3>
                    <p className='mt-2 text-base'>{row.original.excerpt}</p>
                  </div>
                </>
              )}

              {/* Timestamps */}
              <Separator />
              <div className='flex justify-between text-sm text-muted-foreground'>
                <span>Created: {formatDate(row.original.createdAt)}</span>
                <span>Updated: {formatDate(row.original.updatedAt)}</span>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Status Toggle Button */}
      <Button
        onClick={() =>
          handleStatusToggle(row.original.id, !row.original.isDraft)
        }
        size={'sm'}
        className='h-6 bg-blue-500 px-2 hover:bg-blue-600'
      >
        {row.original.isDraft ? 'Publish' : 'Conceal'}
      </Button>

      <Button
        onClick={() => handleEditBlog(row.original.id)}
        size={'sm'}
        variant={'default'}
        className='h-6 bg-blue-500 px-2 hover:bg-blue-600'
      >
        <Pencil className='h-4 w-4' />
      </Button>

      <span>
        <Button
          size={'sm'}
          variant={'destructive'}
          className='h-6 px-2'
          onClick={() => setOpen(true)}
        >
          <Trash className='h-4 w-4' />
        </Button>
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          title='Delete Blog'
          desc='Are you sure you want to delete this blog? This action cannot be undone.'
          confirmText='Delete Blog'
          destructive
          isLoading={isLoading}
          handleConfirm={handleDelete}
        />
      </span>
    </div>
  )
}

export default BlogRowAction
