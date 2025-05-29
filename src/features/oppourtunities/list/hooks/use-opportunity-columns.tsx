import { ColumnDef } from '@tanstack/react-table'
import { OpportunityResponseDto } from '@/api/types.gen'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '../../../../components/data-table/data-table-column-header'
import OpportunitiesRowAction from '../components/opportunity-row-actions'

export const useOpportunitiesColumns = () => {
  const columns: ColumnDef<OpportunityResponseDto>[] = [
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Title' />
      ),
      cell: ({ row }) => <div>{row.original.title}</div>,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'description',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Description' />
      ),
      cell: ({ row }) => {
        const { description } = row.original

        return (
          <div
            className='flex space-x-2'
            dangerouslySetInnerHTML={{
              __html: description.toString().slice(0, 50) + '...',
            }}
          />
        )
      },
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: 'organizer',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Organizer' />
      ),
      cell: ({ row }) => <div>{row.original.organizer}</div>,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Opportunity Status' />
      ),
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <Badge
            variant={row.original.status === 'open' ? 'default' : 'secondary'}
            className='text-sm'
          >
            {row.original.status}
          </Badge>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'isDraft',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title=' Status' />
      ),
      cell: ({ row }) => (
        <div className='min-w-[100px] max-w-[100px]'>
          {row.getValue('isDraft') ? (
            <Badge className='bg-yellow-500'>Draft</Badge>
          ) : (
            <Badge className='bg-green-500'>Published</Badge>
          )}
        </div>
      ),
    },

    {
      id: 'actions',
      cell: ({ row }) => <OpportunitiesRowAction row={row} />,
    },
  ]

  return columns
}
