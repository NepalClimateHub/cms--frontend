import { ColumnDef } from '@tanstack/react-table'
import Tags from '@/schemas/tags/tags'
import { Badge } from '@/ui/shadcn/badge'
import { DataTableColumnHeader } from '../../../../components/data-table/data-table-column-header'
import TagsRowAction from '../components/tags-row-actions'

export const useTagsColumns = () => {
  const columns: ColumnDef<Tags>[] = [
    {
      accessorKey: 'tag',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Name' />
      ),
      cell: ({ row }) => <div>{row.getValue('tag')}</div>,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Type' />
      ),
      cell: ({ row }) => {
        const {
          isEventTag,
          isNewsTag,
          isOrganizationTag,
          isOpportunityTag,
          isUserTag,
          // @ts-ignore
          isBlogTag,
        } = row.original

        return (
          <div className='flex space-x-2'>
            {isEventTag && (
              <Badge className='bg-blue-500 text-white'>Event</Badge>
            )}
            {isNewsTag && <Badge className='bg-red-500 text-white'>News</Badge>}
            {isOrganizationTag && (
              <Badge className='bg-green-500 text-white'>Organization</Badge>
            )}
            {isOpportunityTag && (
              <Badge className='bg-yellow-500 text-black'>Opportunity</Badge>
            )}
            {isUserTag && (
              <Badge className='bg-purple-500 text-white'>User</Badge>
            )}
            {isBlogTag && (
              <Badge className='bg-gray-500 text-white'>Blog</Badge>
            )}
          </div>
        )
      },
      enableSorting: false,
      enableHiding: true,
    },
    {
      id: 'actions',
      cell: ({ row }) => <TagsRowAction row={row} />,
    },
  ]

  return columns
}
