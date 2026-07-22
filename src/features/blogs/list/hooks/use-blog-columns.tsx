import { ColumnDef } from '@tanstack/react-table'
import { BlogResponseDto } from '@/query/blogs/use-blogs'
import { ImagePreviewDialog } from '@/ui/image-preview-dialog'
import { DataTableColumnHeader } from '@/ui/molecules/data-table/data-table-column-header'
import { Badge } from '@/ui/shadcn/badge'
import { cn } from '@/ui/shadcn/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/ui/shadcn/popover'
import { Info } from 'lucide-react'
import BlogRowAction from '../components/blog-row-actions'

export const useBlogsColumns = ({
  onViewAuthorProfile,
}: {
  onViewAuthorProfile?: (userId: string) => void
} = {}) => {
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
        const category = row.original.category
        return (
          <div className='flex flex-col items-start gap-1'>
            <div className='max-w-[250px] whitespace-normal font-medium leading-tight'>
              {displayTitle}
            </div>
            {category && (
              <Badge variant='outline' className='text-[11px] font-normal text-muted-foreground bg-muted/20'>
                {category}
              </Badge>
            )}
          </div>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'author',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Author' />
      ),
      cell: ({ row }) => {
        const authorId = row.original.authorUser?.id
        const authorName = row.original.author
        if (authorId && onViewAuthorProfile) {
          return (
            <button
              onClick={() => onViewAuthorProfile(authorId)}
              className='text-blue-600 hover:text-blue-800 hover:underline font-medium text-left cursor-pointer transition-colors'
            >
              {authorName}
            </button>
          )
        }
        return <div>{authorName}</div>
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'publishedDate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Published Date' />
      ),
      cell: ({ row }) => {
        const publishedDate = row.original.publishedDate
        if (!publishedDate) return <div>N/A</div>
        const formattedDate = new Date(publishedDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
        return <div>{formattedDate}</div>
      },
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Status' />
      ),
      cell: ({ row }) => {
        let status =
          ((row.original as unknown as Record<string, unknown>)
            .status as string) || 'DRAFT'

        // Fallback logic if status is inconsistent with isDraft.
        // Only the backend's own `status` can say PUBLISHED - `approvedByAdmin`
        // can go stale (e.g. after a re-edit), so it must never be used to
        // upgrade the displayed status to PUBLISHED.
        if (status === 'DRAFT' && !row.original.isDraft) {
          status = 'UNDER_REVIEW'
        }

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
          <div className='flex items-center gap-2'>
            <Badge className={config.className}>{config.label}</Badge>
            {status === 'REJECTED' && row.original.reviewFeedback && (
              <Popover>
                <PopoverTrigger asChild>
                  <button className='flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200'>
                    <Info className='h-3 w-3' />
                  </button>
                </PopoverTrigger>
                <PopoverContent className='w-80'>
                  <div className='space-y-2'>
                    <h4 className='font-medium leading-none'>
                      Rejection Reason
                    </h4>
                    <p className='text-sm text-muted-foreground'>
                      {row.original.reviewFeedback}
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
            )}
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
