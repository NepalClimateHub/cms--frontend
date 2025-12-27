import { useState } from 'react'
import { format } from 'date-fns'
import { useNavigate } from '@tanstack/react-router'
import { Row } from '@tanstack/react-table'
import {
  useDeleteBlog,
  useApproveBlog,
  useRejectBlog,
} from '@/query/blogs/use-blogs'
import { ConfirmDialog } from '@/ui/confirm-dialog'
import { Badge } from '@/ui/shadcn/badge'
import { Button } from '@/ui/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/ui/shadcn/dialog'
import { Separator } from '@/ui/shadcn/separator'
// import { useDeleteBlog, useBlogAPI } from '@/query/blogs/use-blogs'
import { LucideEye, Pencil, Trash, CheckCircle, XCircle } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

interface BlogRowActionProps {
  row: Row<any>
}

const BlogRowAction = ({ row }: BlogRowActionProps) => {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuthStore()
  const isAdmin = user?.isSuperAdmin === true

  const blogDeleteMutation = useDeleteBlog()
  const approveBlogMutation = useApproveBlog()
  const rejectBlogMutation = useRejectBlog()

  const blogStatus = (row.original as any).status || 'DRAFT'

  const handleStatusToggle = (blogId: string, isDraft: boolean) => {
    // @ts-ignore
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
    blogDeleteMutation.mutate(
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
        <DialogContent className='flex max-h-[90vh] max-w-5xl flex-col overflow-hidden'>
          <DialogHeader className='flex-shrink-0'>
            <DialogTitle className='text-2xl font-bold'>
              {row.original.title}
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className='min-h-0 flex-1 space-y-6 overflow-y-auto pr-2'>
            {/* Banner Image with Category, Status, and Author */}
            <div className='flex items-center gap-4'>
              {/* Banner Image (Cover Image) */}
              {row.original.bannerImageUrl && (
                <div className='relative h-[50px] w-[50px] flex-shrink-0 overflow-hidden rounded-lg'>
                  <img
                    src={row.original.bannerImageUrl}
                    alt={`${row.original.title} banner`}
                    className='h-full w-full object-cover'
                  />
                </div>
              )}

              {/* Category, Status, and Author */}
              <div className='flex flex-1 flex-row items-center justify-between gap-2'>
                <div className='flex items-center gap-2'>
                  <Badge variant='outline' className='text-sm'>
                    {row.original.category}
                  </Badge>
                  {(() => {
                    const status = (row.original as any).status || 'DRAFT'
                    const statusConfig: Record<
                      string,
                      {
                        label: string
                        variant: 'default' | 'secondary' | 'outline'
                        className: string
                      }
                    > = {
                      DRAFT: {
                        label: 'Draft',
                        variant: 'secondary',
                        className: 'bg-yellow-100',
                      },
                      UNDER_REVIEW: {
                        label: 'Under Review',
                        variant: 'outline',
                        className: 'bg-blue-100',
                      },
                      PUBLISHED: {
                        label: 'Published',
                        variant: 'default',
                        className: 'bg-green-100',
                      },
                      REJECTED: {
                        label: 'Rejected',
                        variant: 'outline',
                        className: 'bg-red-100',
                      },
                    }
                    const config = statusConfig[status] || statusConfig.DRAFT
                    return (
                      <Badge
                        variant={config.variant}
                        className={`${config.className} text-sm`}
                      >
                        {config.label}
                      </Badge>
                    )
                  })()}
                </div>
                <div className='text-right'>
                  <h3 className='text-start text-sm font-semibold text-muted-foreground'>
                    Author
                  </h3>
                  <p className='text-base'>{row.original.author}</p>
                </div>
              </div>
            </div>

            <hr />
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
        </DialogContent>
      </Dialog>

      {/* Approve/Reject Buttons - Only show for blogs under review and admin users */}
      {blogStatus === 'UNDER_REVIEW' && isAdmin && (
        <>
          <Button
            onClick={() => approveBlogMutation.mutate({ id: row.original.id })}
            size={'sm'}
            variant={'default'}
            className='h-6 bg-green-500 px-2 hover:bg-green-600'
            disabled={approveBlogMutation.isPending}
          >
            <CheckCircle className='h-4 w-4' />
          </Button>
          <Button
            onClick={() => rejectBlogMutation.mutate({ id: row.original.id })}
            size={'sm'}
            variant={'default'}
            className='h-6 bg-red-500 px-2 hover:bg-red-600'
            disabled={rejectBlogMutation.isPending}
          >
            <XCircle className='h-4 w-4' />
          </Button>
        </>
      )}

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
