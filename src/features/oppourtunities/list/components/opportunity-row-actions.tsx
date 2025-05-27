import { FC } from 'react'
import { format } from 'date-fns'
import { Row } from '@tanstack/react-table'
import { useDeleteOpportunity } from '@/query/opportunities/use-opportunities'
import { LucideEye, Pencil, Trash } from 'lucide-react'
import { OpportunityResponseDto } from '@/api/types.gen'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'

type OpportunitiesRowActionProps = {
  row: Row<OpportunityResponseDto>
}

const OpportunitiesRowAction: FC<OpportunitiesRowActionProps> = ({ row }) => {
  const { mutate: deleteOpportunityMutation } = useDeleteOpportunity()

  const formatDate = (date: string | undefined) => {
    if (!date) return 'Not specified'
    return format(new Date(date), 'PPP')
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
                  {row.original.type}
                </Badge>
                <Badge variant='outline' className='text-sm'>
                  {row.original.format}
                </Badge>
                <Badge
                  variant={
                    row.original.status === 'open' ? 'default' : 'secondary'
                  }
                  className='text-sm'
                >
                  {row.original.status}
                </Badge>
              </div>

              {/* Organizer Section */}
              <div>
                <h3 className='text-sm font-semibold text-muted-foreground'>
                  Organizer
                </h3>
                <p className='text-base'>{row.original.organizer}</p>
              </div>

              {/* Description Section */}
              <div>
                <h3 className='text-sm font-semibold text-muted-foreground'>
                  Description
                </h3>
                <div
                  className='prose prose-sm mt-2 max-w-none text-base'
                  dangerouslySetInnerHTML={{ __html: row.original.description }}
                />
              </div>

              <Separator />

              {/* Details Grid */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <h3 className='text-sm font-semibold text-muted-foreground'>
                    Location
                  </h3>
                  <p className='text-base'>{row.original.location}</p>
                </div>
                <div>
                  <h3 className='text-sm font-semibold text-muted-foreground'>
                    Location Type
                  </h3>
                  <p className='text-base'>{row.original.locationType}</p>
                </div>
                <div>
                  <h3 className='text-sm font-semibold text-muted-foreground'>
                    Application Deadline
                  </h3>
                  <p className='text-base'>
                    {formatDate(row.original.applicationDeadline)}
                  </p>
                </div>
                <div>
                  <h3 className='text-sm font-semibold text-muted-foreground'>
                    Cost
                  </h3>
                  <p className='text-base'>
                    {row.original.cost || 'Not specified'}
                  </p>
                </div>
                <div>
                  <h3 className='text-sm font-semibold text-muted-foreground'>
                    Contact Email
                  </h3>
                  <p className='text-base'>
                    {row.original.contactEmail || 'Not specified'}
                  </p>
                </div>
                <div>
                  <h3 className='text-sm font-semibold text-muted-foreground'>
                    Website
                  </h3>
                  <p className='text-base'>
                    {/* @ts-ignore */}
                    {row.original?.websiteUrl || 'Not specified'}
                  </p>
                </div>
              </div>

              {/* Address Section */}
              {row.original.address && (
                <>
                  <Separator />
                  <div>
                    <h3 className='text-sm font-semibold text-muted-foreground'>
                      Address
                    </h3>
                    <div className='mt-2 grid grid-cols-2 gap-4'>
                      {row.original.address.state && (
                        <div>
                          <span className='text-sm text-muted-foreground'>
                            State:
                          </span>
                          <p className='text-base'>
                            {row.original.address.state}
                          </p>
                        </div>
                      )}
                      {row.original.address.city && (
                        <div>
                          <span className='text-sm text-muted-foreground'>
                            City:
                          </span>
                          <p className='text-base'>
                            {row.original.address.city}
                          </p>
                        </div>
                      )}
                      {row.original.address.country && (
                        <div>
                          <span className='text-sm text-muted-foreground'>
                            Country:
                          </span>
                          <p className='text-base'>
                            {row.original.address.country}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Timestamps */}
              <Separator />
              <div className='flex justify-between text-sm text-muted-foreground'>
                {/* @ts-ignore */}
                <span>Created: {formatDate(row.original.createdAt)}</span>
                {/* @ts-ignore */}
                <span>Updated: {formatDate(row.original.updatedAt)}</span>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Button
        onClick={() => {}}
        size={'sm'}
        variant={'default'}
        className='h-6 bg-blue-500 px-2 hover:bg-blue-600'
      >
        <Pencil className='h-4 w-4' />
      </Button>

      <Dialog>
        <DialogTrigger>
          <Button size={'sm'} variant={'destructive'} className='h-6 px-2'>
            <Trash className='h-4 w-4' />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Opportunity</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this opportunity? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type='submit'
              variant='destructive'
              onClick={() => {
                deleteOpportunityMutation({
                  path: {
                    id: row.original.id,
                  },
                })
              }}
            >
              Delete Opportunity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default OpportunitiesRowAction
