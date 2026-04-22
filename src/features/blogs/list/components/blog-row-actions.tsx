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

import { BlogResponseDto } from '@/query/blogs/use-blogs'
import { getRoleFromToken } from '@/utils/jwt.util'
import { isAdminLevel } from '@/utils/role-check.util'

interface BlogRowActionProps {
  row: Row<BlogResponseDto>
}

const BlogRowAction = ({ row }: BlogRowActionProps) => {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const role = getRoleFromToken()

  const blogDeleteMutation = useDeleteBlog()
  const approveBlogMutation = useApproveBlog()
  const rejectBlogMutation = useRejectBlog()

  const blogStatus = row.original.status || 'DRAFT'

  const handleStatusToggle = (_blogId: string, _isDraft: boolean) => {
    // TODO: Wire up updateBlogMutation when available
  }

  const formatDateShort = (date: string | undefined | Date) => {
    if (date == null || date === '') return ''
    try {
      return format(new Date(date), 'PPP')
    } catch {
      return String(date)
    }
  }

  const tagLabel = (tag: unknown): string => {
    if (tag && typeof tag === 'object' && 'tag' in tag) {
      return String((tag as { tag: unknown }).tag)
    }
    return ''
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
          <DialogDescription className='min-h-0 flex-1 space-y-4 overflow-y-auto pr-2 text-foreground'>
            {row.original.bannerImageUrl ? (
              <div className='overflow-hidden rounded-lg border'>
                <img
                  src={row.original.bannerImageUrl}
                  alt=''
                  className='max-h-40 w-full object-cover'
                />
              </div>
            ) : null}

            <div className='flex flex-wrap items-center gap-2'>
              <Badge variant='outline'>{row.original.category}</Badge>
              {(() => {
                const status = row.original.status || 'DRAFT'
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
                    className={config.className}
                  >
                    {config.label}
                  </Badge>
                )
              })()}
              {row.original.isFeatured ? (
                <Badge variant='secondary'>Featured</Badge>
              ) : null}
              {row.original.isTopRead ? (
                <Badge variant='secondary'>Top read</Badge>
              ) : null}
            </div>

            <p className='text-sm text-muted-foreground'>
              <span>By {row.original.author}</span>
              {row.original.readingTime ? (
                <span> · {row.original.readingTime}</span>
              ) : null}
              {row.original.publishedDate ? (
                <span> · {formatDateShort(row.original.publishedDate)}</span>
              ) : null}
            </p>

            {row.original.excerpt?.trim() ? (
              <p className='text-sm leading-relaxed text-muted-foreground'>
                {row.original.excerpt}
              </p>
            ) : null}

            <Separator />

            <div
              className='prose prose-sm max-w-none dark:prose-invert'
              dangerouslySetInnerHTML={{ __html: row.original.content }}
            />

            {row.original.tags &&
            Array.isArray(row.original.tags) &&
            row.original.tags.length > 0 ? (
              <div className='flex flex-wrap gap-1.5 pt-1'>
                {row.original.tags.map((tag, idx) => {
                  const label = tagLabel(tag)
                  const id =
                    tag &&
                    typeof tag === 'object' &&
                    'id' in tag &&
                    (tag as { id: unknown }).id != null
                      ? String((tag as { id: unknown }).id)
                      : `tag-${idx}`
                  return (
                    <Badge key={id} variant='outline' className='text-xs'>
                      {label || JSON.stringify(tag)}
                    </Badge>
                  )
                })}
              </div>
            ) : null}
          </DialogDescription>
        </DialogContent>
      </Dialog>

      {/* Approve/Reject: staff (incl. content admin) for blogs under review */}
      {blogStatus === 'UNDER_REVIEW' && isAdminLevel(role) && (
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

      {/* Publish/Conceal: staff only; not for INDIVIDUAL or ORGANIZATION */}
      {isAdminLevel(role) && (
        <Button
          onClick={() =>
            handleStatusToggle(row.original.id, !row.original.isDraft)
          }
          size={'sm'}
          className='h-6 bg-blue-500 px-2 hover:bg-blue-600'
        >
          {row.original.isDraft ? 'Publish' : 'Conceal'}
        </Button>
      )}

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
