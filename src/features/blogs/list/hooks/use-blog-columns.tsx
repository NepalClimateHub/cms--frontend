import { ColumnDef } from '@tanstack/react-table'
import { BlogResponseDto } from '@/query/blogs/use-blogs'
import { ImagePreviewDialog } from '@/ui/image-preview-dialog'
import { DataTableColumnHeader } from '@/ui/molecules/data-table/data-table-column-header'
import { Badge } from '@/ui/shadcn/badge'
import { cn } from '@/ui/shadcn/lib/utils'
import BlogRowAction from '../components/blog-row-actions'

export const useBlogsColumns = () => {
  const columns: ColumnDef<BlogResponseDto>[] = [
    {
      id: 'image',
      header: () => <span></span>,
      cell: ({ row }) => {
        const { bannerImageUrl, title } = row.original
        const isPlaceholder = !bannerImageUrl
        const imageUrl = bannerImageUrl || '/images/logo.png'

        return (
          <ImagePreviewDialog
            src={imageUrl}
            alt={title}
            trigger={
              <div className='flex cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-gray-50/50 transition-opacity hover:opacity-80'>
                <img
                  src={imageUrl}
                  alt={title}
                  className={cn(
                    'h-[100px] w-[160px] rounded transition-transform duration-300 hover:scale-105',
                    isPlaceholder
                      ? 'bg-white/50 object-contain p-4'
                      : 'object-cover'
                  )}
                />
              </div>
            }
          />
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
      cell: ({ row }) => {
        const title = row.original.title
        const words = title.split(' ')
        const displayTitle =
          words.length > 5 ? words.slice(0, 5).join(' ') + '...' : title
        return (
          <div className='max-w-[250px] whitespace-normal font-medium leading-tight'>
            {displayTitle}
          </div>
        )
      },
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
        const status =
          ((row.original as unknown as Record<string, unknown>)
            .status as string) || 'DRAFT'
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
          <div className='min-w-[140px] max-w-[140px]'>
            <Badge className={config.className}>{config.label}</Badge>
          </div>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => <BlogRowAction row={row} />,
    },
  ]

  return columns
}
