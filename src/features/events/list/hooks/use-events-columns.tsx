import { ColumnDef } from '@tanstack/react-table'
import { EventFormValues } from '@/schemas/event'
import { Badge } from '@/ui/shadcn/badge'
import { DataTableColumnHeader } from '../../../../ui/data-table/data-table-column-header'
import EventRowAction from '../components/event-row-actions'

type EventCols = EventFormValues & {
  id: string
  isDraft: boolean
}

export const useEventsColumns = () => {
  const columns: ColumnDef<EventCols>[] = [
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Title' />
      ),
      cell: ({ row }) => {
        const { title } = row.original
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
        return (
          <div className='min-w-[100px] max-w-[100px]'>
            {row.getValue('isDraft') ? (
              <Badge className='bg-yellow-500'>Draft</Badge>
            ) : (
              <Badge className='bg-green-500'>Published</Badge>
            )}
          </div>
        )
      },
      enableSorting: false,
      enableHiding: true,
    },
    {
      id: 'actions',
      // @ts-ignore
      cell: ({ row }) => <EventRowAction row={row} />,
    },
  ]

  return columns
}
