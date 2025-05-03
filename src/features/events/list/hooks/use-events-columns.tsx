import { ColumnDef } from '@tanstack/react-table'
import { EventFormValues } from '@/schemas/event'
import { DataTableColumnHeader } from '../../../../components/data-table/data-table-column-header'
import { Badge } from '@/components/ui/badge'

export const useEventsColumns = () => {
  const columns: ColumnDef<EventFormValues>[] = [
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
        console.log("row", row.original)
        return <div>{row.getValue('isDraft') ? <Badge className='bg-yellow-500'>Draft</Badge> : <Badge className='bg-green-500'>Published</Badge>}</div>
      },
      enableSorting: false,
      enableHiding: true,
    },
    {
      id: 'actions',
      //   cell: ({ row }) => <TagsRowAction row={row} />,
      cell: () => {
        return (
          <div>Actions</div>
        )
      }
    },
  ]

  return columns
}
