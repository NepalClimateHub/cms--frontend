
import { FC, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Row } from '@tanstack/react-table'
import { Eye, Pen, Trash } from 'lucide-react'
import { useDeleteProject, ProjectResponseDto } from '@/query/projects/use-projects'
import { ConfirmDialog } from '@/ui/confirm-dialog'
import { Button } from '@/ui/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/ui/shadcn/dialog'
import { Badge } from '@/ui/shadcn/badge'
import { Separator } from '@/ui/shadcn/separator'
import { format } from 'date-fns'

interface DataTableRowActionsProps {
  row: Row<ProjectResponseDto>
}

const ProjectRowActions: FC<DataTableRowActionsProps> = ({ row }) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const deleteProjectMutation = useDeleteProject()

  const handleDelete = () => {
    deleteProjectMutation.mutate(row.original.id, {
      onSuccess: () => {
        setIsConfirmOpen(false)
      },
    })
  }

  const formatDate = (date: string | undefined) => {
    if (!date) return 'Not specified'
    return format(new Date(date), 'PPP')
  }

  return (
    <>
      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title='Delete Project'
        desc='Are you sure you want to delete this project? This action cannot be undone.'
        confirmText='Delete'
        destructive
        isLoading={deleteProjectMutation.isPending}
        handleConfirm={handleDelete}
      />
      <div className='flex items-center justify-center gap-4'>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              size='sm'
              variant='default'
              className='h-6 bg-green-500 px-2 hover:bg-green-600'
            >
              <Eye className='h-4 w-4' />
            </Button>
          </DialogTrigger>
          <DialogContent className='flex max-h-[90vh] max-w-5xl flex-col overflow-hidden'>
            <DialogHeader className='flex-shrink-0'>
              <DialogTitle className='text-2xl font-bold'>
                {row.original.title}
              </DialogTitle>
            </DialogHeader>
            <DialogDescription className='min-h-0 flex-1 space-y-6 overflow-y-auto pr-2'>
              {/* Banner Image with Status and Duration */}
              <div className='flex items-center gap-4'>
                {row.original.bannerImageUrl && (
                  <div className='relative h-[50px] w-[50px] flex-shrink-0 overflow-hidden rounded-lg'>
                    <img
                      src={row.original.bannerImageUrl}
                      alt={`${row.original.title} banner`}
                      className='h-full w-full object-cover'
                    />
                  </div>
                )}

                <div className='flex flex-1 flex-row items-center justify-between gap-2'>
                  <div className='flex items-center gap-2'>
                    <Badge
                      variant={row.original.status === 'ONGOING' ? 'default' : row.original.status === 'COMPLETED' ? 'secondary' : 'outline'}
                      className={row.original.status === 'COMPLETED' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}
                    >
                      {row.original.status}
                    </Badge>
                    <Badge variant={row.original.isDraft ? 'secondary' : 'default'} className={row.original.isDraft ? 'bg-yellow-100' : 'bg-green-100'}>
                      {row.original.isDraft ? 'Draft' : 'Published'}
                    </Badge>
                  </div>
                  {row.original.duration && (
                    <div className='text-right'>
                      <h3 className='text-start text-sm font-semibold text-muted-foreground'>
                        Duration
                      </h3>
                      <p className='text-base'>{row.original.duration}</p>
                    </div>
                  )}
                </div>
              </div>

              <hr />

              {/* Overview Section */}
              {row.original.overview && (
                <div>
                  <h3 className='text-sm font-semibold text-muted-foreground'>
                    Overview
                  </h3>
                  <p className='mt-2 text-base'>{row.original.overview}</p>
                </div>
              )}

              {/* Description Section */}
              {row.original.description && (
                <>
                  <Separator />
                  <div>
                    <h3 className='text-sm font-semibold text-muted-foreground'>
                      Description
                    </h3>
                    <div
                      className='prose prose-sm mt-2 max-w-none text-base'
                      dangerouslySetInnerHTML={{ __html: row.original.description }}
                    />
                  </div>
                </>
              )}

              {/* Tags Section */}
              {row.original.tags && Array.isArray(row.original.tags) && row.original.tags.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className='mb-2 text-sm font-semibold text-muted-foreground'>
                      Tags
                    </h3>
                    <div className='flex flex-wrap gap-2'>
                      {row.original.tags.map((tag: { id: string; tag: string }) => (
                        <Badge key={tag.id} variant='outline' className='text-sm'>
                          {tag.tag}
                        </Badge>
                      ))}
                    </div>
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

        <Link to='/projects/$id' params={{ id: row.original.id }}>
          <Button
            size='sm'
            variant='default'
            className='h-6 bg-blue-500 px-2 hover:bg-blue-600'
          >
            <Pen className='h-4 w-4' />
          </Button>
        </Link>
        <Button
          size='sm'
          variant='destructive'
          className='h-6 px-2'
          onClick={() => setIsConfirmOpen(true)}
        >
          <Trash className='h-4 w-4' />
        </Button>
      </div>
    </>
  )
}

export default ProjectRowActions
