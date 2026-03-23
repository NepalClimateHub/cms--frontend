
import { ColumnDef } from '@tanstack/react-table'
import { ProjectResponseDto } from '@/query/projects/use-projects'

import ProjectRowActions from '../components/project-row-actions'
import { DataTableColumnHeader } from '@/ui/data-table/data-table-column-header'
import { Badge } from '@/ui/shadcn/badge'
import { format } from 'date-fns'

export const useProjectColumns = (): ColumnDef<ProjectResponseDto>[] => {
  return [

    {
      accessorKey: 'title',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Title' />
      ),
      cell: ({ row }) => {
        return (
          <div className='flex space-x-2'>
            <span className='max-w-[500px] truncate font-medium'>
              {row.getValue('title')}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Status' />
      ),
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        return (
          <div className='flex w-[100px] items-center'>
            <Badge
              variant={status === 'ONGOING' ? 'default' : status === 'COMPLETED' ? 'secondary' : 'outline'}
              className={status === 'COMPLETED' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}
            >
              {status}
            </Badge>
          </div>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: 'duration',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Duration' />
      ),
      cell: ({ row }) => {
        return (
          <div className='flex items-center'>
            <span>{row.getValue('duration') || '-'}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Created At' />
      ),
      cell: ({ row }) => {
        return (
          <div className='flex items-center'>
            <span>{format(new Date(row.getValue('createdAt')), 'PPP')}</span>
          </div>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => <ProjectRowActions row={row} />,
    },
  ]
}
