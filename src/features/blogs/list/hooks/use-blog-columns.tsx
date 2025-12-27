import { ColumnDef } from '@tanstack/react-table'
import { BlogResponseDto } from '@/query/blogs/use-blogs'
import { Badge } from '@/ui/shadcn/badge'
import { DataTableColumnHeader } from '../../../../ui/data-table/data-table-column-header'
import BlogRowAction from '../components/blog-row-actions'

export const useBlogsColumns = () => {
  const columns: ColumnDef<BlogResponseDto>[] = [
    {
      id: 'image',
      header: () => <span></span>,
      cell: ({ row }) => {
        const { bannerImageUrl, title } = row.original
        const imageUrl = bannerImageUrl || 'images/logo.png'

        return (
          <div className='flex items-center justify-center'>
            <img
              src={imageUrl}
              alt={title}
              className='h-[80px] w-[80px] rounded object-cover'
            />
          </div>
        )
      },
      enableSorting: false,
      enableHiding: true,
    },
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
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Status' />
      ),
      cell: ({ row }) => {
        const status = (row.original as any).status || 'DRAFT'
        const statusConfig: Record<
          string,
          { label: string; className: string }
        > = {
          DRAFT: { label: 'Draft', className: 'bg-yellow-500' },
          UNDER_REVIEW: { label: 'Under Review', className: 'bg-blue-500' },
          PUBLISHED: { label: 'Published', className: 'bg-green-500' },
          REJECTED: { label: 'Rejected', className: 'bg-red-500' },
        }
        const config = statusConfig[status] || statusConfig.DRAFT
        return (
          <div className='min-w-[100px] max-w-[100px]'>
            <Badge className={config.className}>{config.label}</Badge>
          </div>
        )
      },
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
