import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { DataTableColumnHeader } from '@/ui/molecules/data-table/data-table-column-header'
import MinutesRowAction from '../components/minutes-row-actions'

export const useMinutesColumns = () => {
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Title' />
      ),
      cell: ({ row }) => {
        const { title } = row.original

        return (
          <div className='flex space-x-2 font-medium text-gray-900'>
            <span>{title}</span>
          </div>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'date',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Date' />
      ),
      cell: ({ row }) => {
        const { date } = row.original
        if (!date) return <span>N/A</span>
        try {
          return <span>{format(new Date(date), 'MMM dd, yyyy')}</span>
        } catch (_err) {
          return <span>{String(date)}</span>
        }
      },
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: 'meetingTime',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Meeting Time' />
      ),
      cell: ({ row }) => {
        const { meetingTime } = row.original
        return <span>{meetingTime || 'N/A'}</span>
      },
      enableSorting: false,
      enableHiding: true,
    },
    {
      id: 'actions',
      cell: ({ row }) => <MinutesRowAction row={row} />,
    },
  ]

  return columns
}
