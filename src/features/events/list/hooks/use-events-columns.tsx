import { ColumnDef } from '@tanstack/react-table'
import { EventFormValues } from '@/schemas/event'
import { DataTableColumnHeader } from '../../../../components/data-table/data-table-column-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pencil, Trash } from 'lucide-react'
import { useDeleteEvent, useUpdateEventStatus } from '@/query/events/use-events'

type  EventCols = EventFormValues & { 
  id: string 
  isDraft: boolean 
}

export const useEventsColumns = () => {
  const updateStatusMutation = useUpdateEventStatus()
  const deleteEventMutation = useDeleteEvent()

  const handleStatusToggle = (eventId: string, isDraft: boolean) => {
    updateStatusMutation.mutateAsync({
      eventId,
      isDraft
    })
  }

  const handleDeleteEvent = (eventId: string) => {
    deleteEventMutation.mutateAsync({
      eventId,
    })
  }

  const columns: ColumnDef<EventCols>[] = [
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Title' />
      ),
      cell: ({ row }) => {
        const { title } = row.original

        console.log(row.original)

        return <div className='flex space-x-2'>{title}</div>
      },
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: 'organizer',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Organizer' />
      ),
      cell: ({ row }) => <div>{row.getValue('organizer')}</div>,
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: 'type',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Type' />
      ),
      cell: ({ row }) => <div>{row.getValue('type')}</div>,
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: 'location',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Location' />
      ),
      cell: ({ row }) => <div>{row.getValue('location')}</div>,
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: 'locationType',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Location Type' />
      ),
      cell: ({ row }) => <div>{row.getValue('locationType')}</div>,
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: 'isDraft',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Status' />
      ),
      cell: ({ row }) => {
        return <div>{row.getValue('isDraft') ? <Badge className='bg-yellow-500'>Draft</Badge> : <Badge className='bg-green-500'>Published</Badge>}</div>
      },
      enableSorting: false,
      enableHiding: true,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        return (
          <div className='flex items-center justify-end gap-2'>
            {/* status trigger */}
            <Button onClick={() => handleStatusToggle(row.original.id, !row.original.isDraft)} size={'sm'} className='bg-blue-500 h-6 px-2'>
              {row.getValue('isDraft') ? 'Publish' : 'Conceal'}
            </Button>
            <Button size={'sm'} variant={'default'} className='bg-blue-500 h-6 px-2'>
              <Pencil />
            </Button>
            {/* delete trigger */}
            <Button onClick={() => handleDeleteEvent(row.original.id)} size={'sm'} variant={'destructive'} className='h-6 px-2'>
              <Trash />
            </Button>
          </div>
        )
      }
    },
  ]

  return columns
}
