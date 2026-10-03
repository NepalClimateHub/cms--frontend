import { ColumnDef } from '@tanstack/react-table'
import { EventFormValues } from '@/schemas/event'
import { Badge } from '@/ui/shadcn/badge'
import { DataTableColumnHeader } from '@/ui/molecules/data-table/data-table-column-header'
import EventRowAction from '../components/event-row-actions'
import { ImagePreviewDialog } from '@/ui/image-preview-dialog'

type EventCols = EventFormValues & {
  id: string
  publicationStatus?: 'DRAFT' | 'PUBLISHED'
  isDraft?: boolean
}

export const useEventsColumns = () => {
  const columns: ColumnDef<EventCols>[] = [
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
      cell: ({ row }) => {
        const { title, status } = row.original

        const renderStatusBadge = (s?: string) => {
          switch (s?.toUpperCase()) {
            case 'OPEN':
              return (
                <Badge
                  variant='outline'
                  className='border-emerald-300 bg-emerald-50 px-1.5 py-0 text-[10px] font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                >
                  Open
                </Badge>
              )
            case 'UPCOMING':
              return (
                <Badge
                  variant='outline'
                  className='border-blue-300 bg-blue-50 px-1.5 py-0 text-[10px] font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300'
                >
                  Upcoming
                </Badge>
              )
            case 'CLOSED':
              return (
                <Badge
                  variant='outline'
                  className='border-slate-300 bg-slate-100 px-1.5 py-0 text-[10px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                >
                  Closed
                </Badge>
              )
            default:
              return s ? (
                <Badge variant='outline' className='px-1.5 py-0 text-[10px] font-medium'>
                  {s}
                </Badge>
              ) : null
          }
        }

        return (
          <div className='flex flex-wrap items-center gap-2'>
            <span className='font-medium'>{title}</span>
            {renderStatusBadge(status)}
          </div>
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
      cell: ({ row }) => <div>{row.getValue('organizer')}</div>,
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: 'type',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Type' />
      ),
      cell: ({ row }) => <div>{row.getValue('type')}</div>,
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: 'location',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Location' />
      ),
      cell: ({ row }) => <div>{row.getValue('location')}</div>,
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: 'locationType',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Location Type' />
      ),
      cell: ({ row }) => <div>{row.getValue('locationType')}</div>,
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: 'publicationStatus',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Publication Status' />
      ),
      cell: ({ row }) => {
        const pubStatus =
          row.original.publicationStatus ??
          (row.original.isDraft ? 'DRAFT' : 'PUBLISHED')
        const isDraft = pubStatus === 'DRAFT'

        return (
          <div className='min-w-[100px] max-w-[120px]'>
            {isDraft ? (
              <Badge className='border-amber-200 bg-amber-500 text-white'>
                Draft
              </Badge>
            ) : (
              <Badge className='bg-green-600 text-white'>
                Published
              </Badge>
            )}
          </div>
        )
      },
      enableSorting: false,
      enableHiding: true,
    },
    {
      id: 'actions',
      // @ts-expect-error: fix later
      cell: ({ row }) => <EventRowAction row={row} />,
    },
  ]

  return columns
}
