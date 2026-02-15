
import { ColumnDef } from '@tanstack/react-table'
import { ResourceResponseDto, useDeleteResource } from '@/query/resources/use-resources'
import { Badge } from '@/ui/shadcn/badge'
import { Button } from '@/ui/shadcn/button'
import { Eye, Edit, Trash2 } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { ConfirmDialog } from '@/ui/confirm-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/ui/shadcn/dialog'
import { Separator } from '@/ui/shadcn/separator'
import { format } from 'date-fns'

export const useResourceColumns = (): ColumnDef<ResourceResponseDto>[] => {
  const navigate = useNavigate()
  const deleteResourceMutation = useDeleteResource()

  const formatDate = (date: string | undefined) => {
    if (!date) return 'Not specified'
    return format(new Date(date), 'PPP')
  }

  return [
    {
      accessorKey: 'title',
      header: 'Title',
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => <Badge variant="outline">{row.original.type.replace(/_/g, ' ')}</Badge>
    },
    {
      accessorKey: 'level',
      header: 'Level',
      cell: ({ row }) => row.original.level ? <Badge variant="secondary">{row.original.level}</Badge> : '-'
    },
    {
      accessorKey: 'isDraft',
      header: 'Status',
      cell: ({ row }) => (
        <Badge className={row.original.isDraft ? 'bg-yellow-500' : 'bg-green-500 hover:bg-green-600'}>
          {row.original.isDraft ? 'Draft' : 'Published'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const resource = row.original
        const [isConfirmOpen, setIsConfirmOpen] = useState(false)

        const handleDelete = () => {
          deleteResourceMutation.mutate(resource.id, {
            onSuccess: () => {
              setIsConfirmOpen(false)
            },
          })
        }
 
        return (
          <>
            <ConfirmDialog
              open={isConfirmOpen}
              onOpenChange={setIsConfirmOpen}
              title='Delete Resource'
              desc='Are you sure you want to delete this resource? This action cannot be undone.'
              confirmText='Delete'
              destructive
              isLoading={deleteResourceMutation.isPending}
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
                      {resource.title}
                    </DialogTitle>
                  </DialogHeader>
                  <DialogDescription className='min-h-0 flex-1 space-y-6 overflow-y-auto pr-2'>
                    {/* Banner Image with Type and Level */}
                    <div className='flex items-center gap-4'>
                      {resource.bannerImageUrl && (
                        <div className='relative h-[50px] w-[50px] flex-shrink-0 overflow-hidden rounded-lg'>
                          <img
                            src={resource.bannerImageUrl}
                            alt={`${resource.title} banner`}
                            className='h-full w-full object-cover'
                          />
                        </div>
                      )}

                      <div className='flex flex-1 flex-row items-center justify-between gap-2'>
                        <div className='flex items-center gap-2'>
                          <Badge variant='outline' className='text-sm'>
                            {resource.type.replace(/_/g, ' ')}
                          </Badge>
                          {resource.level && (
                            <Badge variant='secondary' className='text-sm'>
                              {resource.level}
                            </Badge>
                          )}
                          <Badge className={resource.isDraft ? 'bg-yellow-100' : 'bg-green-100'}>
                            {resource.isDraft ? 'Draft' : 'Published'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <hr />

                    {/* Overview Section */}
                    {resource.overview && (
                      <div>
                        <h3 className='text-sm font-semibold text-muted-foreground'>
                          Overview
                        </h3>
                        <p className='mt-2 text-base'>{resource.overview}</p>
                      </div>
                    )}

                    {/* Details Grid */}
                    <Separator />
                    <div className='grid grid-cols-2 gap-4'>
                      {resource.link && (
                        <div>
                          <h3 className='text-sm font-semibold text-muted-foreground'>
                            Link
                          </h3>
                          <a href={resource.link} target='_blank' rel='noopener noreferrer' className='text-base text-blue-500 hover:underline'>
                            {resource.link}
                          </a>
                        </div>
                      )}
                      {resource.courseProvider && (
                        <div>
                          <h3 className='text-sm font-semibold text-muted-foreground'>
                            Course Provider
                          </h3>
                          <p className='text-base'>{resource.courseProvider}</p>
                        </div>
                      )}
                      {resource.platform && (
                        <div>
                          <h3 className='text-sm font-semibold text-muted-foreground'>
                            Platform
                          </h3>
                          <p className='text-base'>{resource.platform}</p>
                        </div>
                      )}
                      {resource.duration && (
                        <div>
                          <h3 className='text-sm font-semibold text-muted-foreground'>
                            Duration
                          </h3>
                          <p className='text-base'>{resource.duration}</p>
                        </div>
                      )}
                      {resource.author && (
                        <div>
                          <h3 className='text-sm font-semibold text-muted-foreground'>
                            Author
                          </h3>
                          <p className='text-base'>{resource.author}</p>
                        </div>
                      )}
                      {resource.publicationYear && (
                        <div>
                          <h3 className='text-sm font-semibold text-muted-foreground'>
                            Publication Year
                          </h3>
                          <p className='text-base'>{resource.publicationYear}</p>
                        </div>
                      )}
                    </div>

                    {/* Tags Section */}
                    {resource.tags && Array.isArray(resource.tags) && resource.tags.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <h3 className='mb-2 text-sm font-semibold text-muted-foreground'>
                            Tags
                          </h3>
                          <div className='flex flex-wrap gap-2'>
                            {resource.tags.map((tag: { id: string; tag: string }) => (
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
                      <span>Created: {formatDate(resource.createdAt)}</span>
                      <span>Updated: {formatDate(resource.updatedAt)}</span>
                    </div>
                  </DialogDescription>
                </DialogContent>
              </Dialog>

              <Button
                size='sm'
                variant='default'
                className='h-6 bg-blue-500 px-2 hover:bg-blue-600'
                onClick={() => navigate({ to: `/resources/${resource.id}` })}
              >
                <Edit className='h-4 w-4' />
              </Button>
              <Button
                size='sm'
                variant='destructive'
                className='h-6 px-2'
                onClick={() => setIsConfirmOpen(true)}
              >
                <Trash2 className='h-4 w-4' />
              </Button>
            </div>
          </>
        )
      },
    },
  ]
}
