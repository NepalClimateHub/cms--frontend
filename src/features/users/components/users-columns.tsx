import { ColumnDef } from '@tanstack/react-table'
import LongText from '@/ui/long-text'
import { cn } from '@/ui/shadcn/lib/utils'
import { userTypes, userTypeOptions } from '../data/data'
import { User } from '../data/schema'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'username',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Username' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-36'>{row.getValue('username')}</LongText>
    ),
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)] lg:drop-shadow-none',
        'bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
        'sticky left-0 md:table-cell'
      ),
    },
    enableHiding: false,
  },
  {
    id: 'fullName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => {
      const { firstName, lastName } = row.original
      const fullName = `${firstName} ${lastName}`
      return <LongText className='max-w-36'>{fullName}</LongText>
    },
    meta: { className: 'w-36' },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => (
      <div className='w-fit text-nowrap'>{row.getValue('email')}</div>
    ),
  },
  {
    accessorKey: 'userType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='User Type' />
    ),
    cell: ({ row }) => {
      const { userType, isSuperAdmin } = row.original

      // Show Superadmin if user is super admin
      if (isSuperAdmin) {
        const superAdminType = userTypes.find(
          ({ value }) => value === 'superadmin'
        )
        if (superAdminType) {
          return (
            <div className='flex items-center gap-x-2'>
              {superAdminType.icon && (
                <superAdminType.icon
                  size={16}
                  className='text-muted-foreground'
                />
              )}
              <span className='text-sm'>Superadmin</span>
            </div>
          )
        }
      }

      const userTypeOption = userTypeOptions.find(
        ({ value }) => value === userType
      )

      if (!userTypeOption) {
        return <span className='text-sm'>{userType}</span>
      }

      return (
        <div className='flex items-center gap-x-2'>
          {userTypeOption.icon && (
            <userTypeOption.icon size={16} className='text-muted-foreground' />
          )}
          <span className='text-sm'>{userTypeOption.label}</span>
        </div>
      )
    },
    filterFn: (row, _id, value) => {
      const { userType, isSuperAdmin } = row.original
      // Include superadmin in filter if checking for admin
      if (isSuperAdmin && value.includes('ADMIN')) {
        return true
      }
      return value.includes(userType)
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
