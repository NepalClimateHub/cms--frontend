import { useState } from 'react'
import { format } from 'date-fns'
import { useNavigate } from '@tanstack/react-router'
import { Row } from '@tanstack/react-table'
import {
  useDeleteBlog,
  useApproveBlog,
  useRejectBlog,
} from '@/query/blogs/use-blogs'
import { BlogResponseDto } from '@/query/blogs/use-blogs'
import { ConfirmDialog } from '@/ui/confirm-dialog'
import { Alert, AlertDescription, AlertTitle } from '@/ui/shadcn/alert'
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
import { DialogFooter } from '@/ui/shadcn/dialog'
import { Separator } from '@/ui/shadcn/separator'
import { Textarea } from '@/ui/shadcn/textarea'
// import { useDeleteBlog, useBlogAPI } from '@/query/blogs/use-blogs'
import {
  LucideEye,
  Pencil,
  Trash,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import { getRoleFromToken } from '@/utils/jwt.util'
import { isAdminLevel } from '@/utils/role-check.util'

interface BlogRowActionProps {
  row: Row<BlogResponseDto>
}

const BlogRowAction = ({ row }: BlogRowActionProps) => {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [rejectionRemarks, setRejectionRemarks] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const role = getRoleFromToken()

  const blogDeleteMutation = useDeleteBlog()
  const approveBlogMutation = useApproveBlog()
  const rejectBlogMutation = useRejectBlog()

  const blogStatus = (() => {
    const status = row.original.status || 'DRAFT'
    // Only the backend's own `status` can say PUBLISHED - `approvedByAdmin`
    // can go stale (e.g. after a re-edit), so it must never be used to
    // upgrade the displayed status to PUBLISHED.
    if (status === 'DRAFT' && !row.original.isDraft) {
      return 'UNDER_REVIEW'
    }
    return status
  })()

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

  const handleApprove = () => {
    approveBlogMutation.mutate(
      { id: row.original.id },
      {
        onSettled: () => {
          setIsApproveDialogOpen(false)
        },
      }
    )
  }

  const handleReject = () => {
    rejectBlogMutation.mutate(
      { id: row.original.id, remarks: rejectionRemarks },
      {
        onSettled: () => {
          setIsRejectDialogOpen(false)
          setRejectionRemarks('')
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
                  <Badge variant={config.variant} className={config.className}>
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
            {row.original.status === 'REJECTED' &&
              row.original.reviewFeedback && (
                <Alert variant='destructive' className='bg-red-50/50'>
                  <AlertCircle className='h-4 w-4' />
                  <AlertTitle>Rejection Remarks</AlertTitle>
                  <AlertDescription className='italic'>
                    "{row.original.reviewFeedback}"
                  </AlertDescription>
                </Alert>
              )}

            {row.original.status !== 'REJECTED' &&
              row.original.reviewFeedback && (
                <div className='rounded-lg border border-orange-200 bg-orange-50 p-4'>
                  <p className='text-xs font-bold uppercase tracking-wider text-orange-800'>
                    Administrative Feedback
                  </p>
                  <p className='mt-1 text-sm italic text-orange-900'>
                    "{row.original.reviewFeedback}"
                  </p>
                </div>
              )}

            <div
              className='prose prose-sm dark:prose-invert max-w-none'
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
        <div className='flex gap-2'>
          <Button
            onClick={() => setIsApproveDialogOpen(true)}
            size={'sm'}
            variant={'default'}
            className='h-7 bg-emerald-600 px-2 text-[10px] font-bold uppercase hover:bg-emerald-700'
            disabled={approveBlogMutation.isPending}
          >
            <CheckCircle className='mr-1 h-3.5 w-3.5' />
            Approve
          </Button>
          <Button
            onClick={() => setIsRejectDialogOpen(true)}
            size={'sm'}
            variant={'destructive'}
            className='h-7 px-2 text-[10px] font-bold uppercase'
            disabled={rejectBlogMutation.isPending}
          >
            <XCircle className='mr-1 h-3.5 w-3.5' />
            Reject
          </Button>
        </div>
      )}

      {/* Approve Confirmation Dialog */}
      <ConfirmDialog
        open={isApproveDialogOpen}
        onOpenChange={setIsApproveDialogOpen}
        title='Approve Blog'
        desc='Are you sure you want to approve this blog? It will be published immediately.'
        confirmText='Yes, Approve'
        cancelBtnText='No, Cancel'
        isLoading={approveBlogMutation.isPending}
        handleConfirm={handleApprove}
      />

      {/* Reject Dialog with Remarks */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Reject Blog</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this blog? You can optionally
              provide feedback to the author below.
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='flex flex-col gap-2'>
              <label htmlFor='remarks' className='text-sm font-medium'>
                Rejection Remarks (Optional)
              </label>
              <Textarea
                id='remarks'
                placeholder='Tell the author why this blog was rejected...'
                value={rejectionRemarks}
                onChange={(e) => setRejectionRemarks(e.target.value)}
                className='min-h-[100px]'
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setIsRejectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={handleReject}
              disabled={rejectBlogMutation.isPending}
            >
              {rejectBlogMutation.isPending ? 'Rejecting...' : 'Reject Blog'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
