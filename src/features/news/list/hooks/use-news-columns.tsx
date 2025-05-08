import { ColumnDef } from '@tanstack/react-table'
import { NewsWithId } from '@/schemas/news/news'
import { DataTableColumnHeader } from '../../../../components/data-table/data-table-column-header'
import NewsRowAction from '../components/news-row-actions'

export const useNewsColumns = () => {
  const columns: ColumnDef<NewsWithId>[] = [
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Title' />
      ),
      cell: ({ row }) => {
        const { title } = row.original

        console.log(row.original)

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
      accessorKey: 'content',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Content' />
      ),
      cell: ({ row }) => {
        const { content } = row.original

        return (
          <div className='flex space-x-2'>
            <span>{content}</span>
          </div>
        )
      },
      enableSorting: false,
      enableHiding: true,
    },
    {
      id: 'actions',
      cell: ({ row }) => <NewsRowAction row={row} />,
    },
  ]

  return columns
}
