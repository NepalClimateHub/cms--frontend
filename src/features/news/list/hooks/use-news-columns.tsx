import { ColumnDef } from '@tanstack/react-table'
import { News } from '@/schemas/news/news'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '../../../../components/data-table/data-table-column-header'
import NewsRowAction from '../components/news-row-actions'

export const useNewsColumns = () => {
  const columns: ColumnDef<News>[] = [
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
