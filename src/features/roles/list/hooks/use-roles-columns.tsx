import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '../../../../components/data-table/data-table-column-header'
import { Roles } from '@/schemas/roles/roles'
import { Badge } from '@/components/ui/badge'
import RolesRowAction from '../components/roles-row-actions'

export const useRoleColumns = () => {
  const columns: ColumnDef<Roles>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Name' />
      ),
      cell: ({ row }) => <div>{row.getValue('name')}</div>,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'isSystemRole',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Type' />
      ),
      cell: ({ row }) => {
        const isSystemRole = row.getValue('isSystemRole')

        return (
          <div className='flex space-x-2'>
            <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
              {isSystemRole ? (<Badge>System Role</Badge>) : (<Badge>Organization Role</Badge>)}
            </span>
          </div>
        )
      },
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: 'organizationId',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Organization' />
      ),
      cell: ({ row }) => {
        const orgID = row.original.organizationId;
        const orgDetails = row.original.organization;
        return (
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {orgID ? orgDetails?.businessName : 'N/A'}
          </span>
        )
      },
      enableSorting: false,
      enableHiding: true,
    },
    {
      id: 'actions',
      cell: ({ row }) => <RolesRowAction row={row} />,
    },
  ]

  return columns
}