import { ColumnDef } from '@tanstack/react-table'
import { BlogResponseDto } from '@/query/blogs/use-blogs'
import { Badge } from '@/ui/shadcn/badge'
import { DataTableColumnHeader } from '../../../../components/data-table/data-table-column-header'
import BlogRowAction from '../components/blog-row-actions'

export const useBlogsColumns = () => {
  const columns: ColumnDef<BlogResponseDto>[] = [
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
      accessorKey: 'content',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Content' />
      ),
      cell: ({ row }) => {
        const { content } = row.original

        return (
          <div
            className='flex space-x-2'
            dangerouslySetInnerHTML={{
              __html: content.toString().slice(0, 50) + '...',
            }}
          />
        )
      },
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: 'author',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Author' />
      ),
      cell: ({ row }) => <div>{row.original.author}</div>,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'category',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Category' />
      ),
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <Badge variant='outline' className='text-sm'>
            {row.original.category}
          </Badge>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'isDraft',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Status' />
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
      accessorKey: 'isFeatured',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Featured' />
      ),
      cell: ({ row }) => (
        <div className='min-w-[100px] max-w-[100px]'>
          {row.getValue('isFeatured') ? (
            <Badge className='bg-purple-500'>Featured</Badge>
          ) : (
            <Badge variant='secondary'>Regular</Badge>
          )}
        </div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => <BlogRowAction row={row} />,
    },
  ]

  return columns
}
