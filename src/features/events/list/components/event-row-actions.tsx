import { FC } from 'react'
import { format } from 'date-fns'
import { useNavigate } from '@tanstack/react-router'
import { Row } from '@tanstack/react-table'
import { useDeleteEvent, useUpdateEventStatus } from '@/query/events/use-events'
import { EventFormValues } from '@/schemas/event'
import {
  LucideEye,
  Pencil,
  Trash,
  Calendar,
  MapPin,
  Users,
  Mail,
  Link,
  Tag,
  DollarSign,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogTrigger,
  DialogTitle,
  DialogHeader,
  DialogContent,
} from '@/components/ui/dialog'

type EventCols = EventFormValues & {
  id: string
  isDraft: boolean
  address?: {
    street: string
    country: string
    city: string
    state: string
    postcode: string
  }
  socials?: {
    data: Array<Record<string, unknown>>
  }
  tags?: Array<{
    tag: string
  }>
}

type EventRowActionProps = {
  row: Row<EventCols>
}

const EventRowAction: FC<EventRowActionProps> = ({ row }) => {
  const navigate = useNavigate()
  const updateStatusMutation = useUpdateEventStatus()
  const deleteEventMutation = useDeleteEvent()

  const handleStatusToggle = (eventId: string, isDraft: boolean) => {
    updateStatusMutation.mutateAsync({
      eventId,
      isDraft,
    })
  }

  const handleDeleteEvent = (eventId: string) => {
    deleteEventMutation.mutateAsync({
      eventId,
    })
  }

  const handleEditEvent = (eventId: string) => {
    navigate({
      to: `/events/${eventId}`,
    })
  }

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'Not specified'
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date
      return format(dateObj, 'MMMM dd, yyyy')
    } catch (_error) {
      return 'Invalid date'
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
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle className='text-2xl font-bold text-gray-900'>
              Event Details
            </DialogTitle>
          </DialogHeader>

          <div className='mt-6 space-y-6'>
            {/* Banner Image */}
            {row.original.bannerImageUrl && (
              <div className='relative aspect-video w-full overflow-hidden rounded-lg'>
                <img
                  src={row.original.bannerImageUrl}
                  alt={row.original.title}
                  className='h-full w-full object-cover'
                />
              </div>
            )}

            {/* Title Section */}
            <div className='space-y-2'>
              <h2 className='text-xl font-semibold text-gray-900'>
                {row.original.title}
              </h2>
              <div className='flex items-center gap-2 text-sm text-gray-500'>
                <Users className='h-4 w-4' />
                <span>{row.original.organizer}</span>
                <span>•</span>
                <span className='capitalize'>{row.original.type}</span>
                <span>•</span>
                <span className='capitalize'>{row.original.format}</span>
              </div>
            </div>

            {/* Event Details */}
            <div className='grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4'>
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm text-gray-600'>
                  <Calendar className='h-4 w-4' />
                  <span>Start Date:</span>
                </div>
                <p className='text-sm font-medium text-gray-900'>
                  {formatDate(row.original.startDate)}
                </p>
              </div>
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm text-gray-600'>
                  <Clock className='h-4 w-4' />
                  <span>Registration Deadline:</span>
                </div>
                <p className='text-sm font-medium text-gray-900'>
                  {formatDate(row.original.registrationDeadline)}
                </p>
              </div>
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm text-gray-600'>
                  <MapPin className='h-4 w-4' />
                  <span>Location:</span>
                </div>
                <p className='text-sm font-medium text-gray-900'>
                  {row.original.location} ({row.original.locationType})
                </p>
                {row.original.address && (
                  <p className='text-sm text-gray-600'>
                    {row.original.address.street}, {row.original.address.city},{' '}
                    {row.original.address.state}, {row.original.address.country}
                    , {row.original.address.postcode}
                  </p>
                )}
              </div>
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm text-gray-600'>
                  <DollarSign className='h-4 w-4' />
                  <span>Cost:</span>
                </div>
                <p className='text-sm font-medium capitalize text-gray-900'>
                  {row.original.cost?.toLowerCase().replace('_', ' ')}
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div className='grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4'>
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm text-gray-600'>
                  <Mail className='h-4 w-4' />
                  <span>Contact Email:</span>
                </div>
                <a
                  href={`mailto:${row.original.contactEmail}`}
                  className='text-sm text-blue-600 hover:text-blue-800 hover:underline'
                >
                  {row.original.contactEmail}
                </a>
              </div>
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm text-gray-600'>
                  <Link className='h-4 w-4' />
                  <span>Registration Link:</span>
                </div>
                <a
                  href={row.original.registrationLink}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-sm text-blue-600 hover:text-blue-800 hover:underline'
                >
                  {row.original.registrationLink}
                </a>
              </div>
            </div>

            {/* Tags */}
            {row.original.tags && row.original.tags.length > 0 && (
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm text-gray-600'>
                  <Tag className='h-4 w-4' />
                  <span>Tags:</span>
                </div>
                <div className='flex flex-wrap gap-2'>
                  {row.original.tags.map((tag) => (
                    <span
                      key={tag.tag}
                      className='rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800'
                    >
                      {tag.tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {row.original.description && (
              <div className='space-y-2'>
                <h3 className='text-sm font-medium text-gray-600'>
                  Description
                </h3>
                <div
                  className='text-sm text-gray-900'
                  dangerouslySetInnerHTML={{ __html: row.original.description }}
                />
              </div>
            )}
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
        onClick={() => handleEditEvent(row.original.id)}
        size={'sm'}
        variant={'default'}
        className='h-6 bg-blue-500 px-2'
      >
        <Pencil />
      </Button>
      {/* delete trigger */}
      <Button
        onClick={() => handleDeleteEvent(row.original.id)}
        size={'sm'}
        variant={'destructive'}
        className='h-6 px-2'
      >
        <Trash />
      </Button>
    </div>
  )
}

export default EventRowAction
