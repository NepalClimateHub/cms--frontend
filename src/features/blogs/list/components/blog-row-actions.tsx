import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Row } from '@tanstack/react-table'
import {
  useDeleteBlog,
  useApproveBlog,
  useRejectBlog,
} from '@/query/blogs/use-blogs'
import { BlogResponseDto } from '@/query/blogs/use-blogs'
import { ConfirmDialog } from '@/ui/confirm-dialog'
import { Button } from '@/ui/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/ui/shadcn/dialog'
import { DialogFooter } from '@/ui/shadcn/dialog'
import { Textarea } from '@/ui/shadcn/textarea'
import {
  LucideEye,
  Pencil,
  Trash,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { getRoleFromToken } from '@/utils/jwt.util'
import { isAdminLevel } from '@/utils/role-check.util'
import BlogPreviewModal from '../../shared/BlogPreviewModal'

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
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

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
      <Button
        size={'sm'}
        variant={'default'}
        className='h-6 bg-green-500 px-2 hover:bg-green-600'
        onClick={() => setIsPreviewOpen(true)}
      >
        <LucideEye className='h-4 w-4' />
      </Button>

      <BlogPreviewModal
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        values={row.original as any}
      />

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
