import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/ui/shadcn/badge'
import { OpportunityResponseDto } from '@/api/types.gen'
import { DataTableColumnHeader } from '../../../../ui/data-table/data-table-column-header'
import OpportunitiesRowAction from '../components/opportunity-row-actions'
import { ImagePreviewDialog } from '@/ui/image-preview-dialog'

export const useOpportunitiesColumns = () => {
  const columns: ColumnDef<OpportunityResponseDto>[] = [
    {
      id: 'image',
      header: () => <span>Image</span>,
      cell: ({ row }) => {
        const { bannerImageUrl, title } = row.original
        const imageUrl = bannerImageUrl || 'images/logo.png'

        return (
          <ImagePreviewDialog
            src={imageUrl}
            alt={title}
            trigger={
              <div className='flex cursor-pointer items-center justify-center transition-opacity hover:opacity-80'>
                <img
                  src={imageUrl}
                  alt={title}
                  className='h-[80px] w-[80px] rounded object-cover'
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
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Opportunity Status' />
      ),
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <Badge
            variant={row.original.status === 'open' ? 'default' : 'secondary'}
            className='text-sm'
          >
            {row.original.status}
          </Badge>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'isDraft',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title=' Status' />
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
      id: 'actions',
      cell: ({ row }) => <OpportunitiesRowAction row={row} />,
    },
  ]

  return columns
}
