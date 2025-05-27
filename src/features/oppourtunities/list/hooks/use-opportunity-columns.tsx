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
      accessorKey: 'tags',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Tags' />
      ),
      cell: ({ row }) => (
        <div className='flex flex-wrap gap-2'>
          {row.original.tags?.map((t: any) => (
            <Badge key={t.tag} variant='outline'>
              {t.tag}
            </Badge>
          ))}
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'actions',
      cell: ({ row }) => <OpportunitiesRowAction row={row} />,
    },
  ]

  return columns
}
