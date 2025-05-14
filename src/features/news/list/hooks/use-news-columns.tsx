import { ColumnDef } from '@tanstack/react-table'
import { NewsResponseDto } from '@/api/types.gen'
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
    {
      id: 'actions',
      cell: ({ row }) => <NewsRowAction row={row} />,
    },
  ]

  return columns
}
