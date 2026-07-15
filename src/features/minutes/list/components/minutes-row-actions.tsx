import { FC } from 'react'
import { format } from 'date-fns'
import { useNavigate } from '@tanstack/react-router'
import { Row } from '@tanstack/react-table'
import { useMinutesAPI } from '@/query/minutes/use-minutes'
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
  Calendar,
  Clock,
} from 'lucide-react'
import { ScrollArea } from '@/ui/shadcn/scroll-area'

type MinutesRowActionProps = {
  row: Row<any>
}

const MinutesRowAction: FC<MinutesRowActionProps> = ({ row }) => {
  const { mutate: deleteMinutesMutation } = useMinutesAPI().deleteMinutes
  const navigate = useNavigate()

  const handleEditMinutes = (minutesId: string) => {
    navigate({
      to: `/minutes/${minutesId}`,
    })
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    try {
      return format(new Date(dateString), 'MMMM dd, yyyy')
    } catch (_error) {
      return dateString
    }
  }

  return (
    <div className='flex items-center justify-end gap-2'>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            size={'sm'}
            variant={'default'}
            className='h-6 bg-green-500 hover:bg-green-600 px-2'
          >
            <LucideEye className='h-3.5 w-3.5' />
          </Button>
        </DialogTrigger>
        <DialogContent className='max-w-2xl max-h-[85vh] flex flex-col gap-0 overflow-hidden p-6'>
          <DialogHeader className='pb-4 border-b'>
            <DialogTitle className='text-2xl font-bold text-gray-900'>
              Meeting Minutes
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className='flex-1 pr-4 mt-4 overflow-y-auto max-h-[60vh]'>
            <div className='space-y-6'>
              {/* Title Section */}
              <div className='space-y-2'>
                <h2 className='text-xl font-semibold text-gray-900'>
                  {row.original.title}
                </h2>
                <div className='flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500'>
                  <div className='flex items-center gap-1.5'>
                    <Calendar className='h-4 w-4' />
                    <span>Date: {formatDate(row.original.date)}</span>
                  </div>
                  <span>•</span>
                  <div className='flex items-center gap-1.5'>
                    <Clock className='h-4 w-4' />
                    <span>Time: {row.original.meetingTime || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Agenda Section */}
              <div className='space-y-2 border-t pt-4'>
                <h3 className='text-sm font-semibold uppercase tracking-wider text-gray-500'>
                  Agenda
                </h3>
                <div
                  className='rounded-lg bg-gray-50 p-4 text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none'
                  dangerouslySetInnerHTML={{ __html: row.original.agenda }}
                />
              </div>

              {/* Summary Section */}
              <div className='space-y-2 border-t pt-4'>
                <h3 className='text-sm font-semibold uppercase tracking-wider text-gray-500'>
                  Meeting Summary
                </h3>
                <div
                  className='rounded-lg bg-gray-50 p-4 text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none'
                  dangerouslySetInnerHTML={{ __html: row.original.meetingSummary }}
                />
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Button
        onClick={() => handleEditMinutes(row.original.id)}
        size={'sm'}
        variant={'default'}
        className='h-6 bg-blue-500 hover:bg-blue-600 px-2'
      >
        <Pencil className='h-3.5 w-3.5' />
      </Button>

      <Dialog>
        <DialogTrigger asChild>
          <Button size={'sm'} variant={'destructive'} className='h-6 px-2'>
            <Trash className='h-3.5 w-3.5' />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Meeting Minutes</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete these meeting minutes? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type='submit'
              variant='destructive'
              onClick={() => {
                deleteMinutesMutation({
                  path: {
                    id: row.original.id,
                  },
                })
              }}
            >
              Delete Minutes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default MinutesRowAction
