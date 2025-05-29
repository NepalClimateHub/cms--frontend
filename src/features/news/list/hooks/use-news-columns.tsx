import { ColumnDef } from '@tanstack/react-table'
import { NewsResponseDto } from '@/api/types.gen'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '../../../../components/data-table/data-table-column-header'
import NewsRowAction from '../components/news-row-actions'

export const useNewsColumns = () => {
  const columns: ColumnDef<NewsResponseDto>[] = [
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Title' />
      ),
      cell: ({ row }) => {
        const { title } = row.original

        return (
          <div className='flex space-x-2'>
            <span>{title}</span>
          </div>
        )
      },
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: 'mode',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Mode' />
      ),
      cell: ({ row }) => {
        const { mode } = row.original

        return (
          <div className='flex space-x-2'>
            <span>{mode}</span>
          </div>
        )
      },
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: 'source',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Source' />
      ),
      cell: ({ row }) => {
        const { source } = row.original

        return (
          <div className='flex space-x-2'>
            <span>{source}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'newsLink',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='News Link' />
      ),
      cell: ({ row }) => {
        const { newsLink } = row.original

        return (
          <div className='flex space-x-2'>
            <a href={newsLink} target='_blank' rel='noopener noreferrer'>
              <span>{newsLink}</span>
            </a>
          </div>
        )
      },
    },
    // add status column
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
    },
    {
      id: 'actions',
      cell: ({ row }) => <NewsRowAction row={row} />,
    },
  ]

  return columns
}
