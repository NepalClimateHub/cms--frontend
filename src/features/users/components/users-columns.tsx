import { ColumnDef } from '@tanstack/react-table'
import LongText from '@/ui/long-text'
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/shadcn/avatar'
import { getInitialsForAvatar } from '@/ui/shadcn/lib/utils'
import { cn } from '@/ui/shadcn/lib/utils'
import { userTypes, userTypeOptions } from '../data/data'
import { User } from '../data/schema'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'
import { ImagePreviewDialog } from '@/ui/image-preview-dialog'

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'username',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Username' />
    ),
    cell: ({ row }) => {
      const { firstName, lastName, profilePhotoUrl } = row.original
      const fullName = `${firstName} ${lastName}`
      const initials = getInitialsForAvatar(fullName)
      const username = row.getValue('username') as string

      return (
        <div className='flex items-center gap-2'>
          <ImagePreviewDialog
            src={profilePhotoUrl || 'images/logo.png'}
            alt={fullName}
            trigger={
              <Avatar className='h-8 w-8 shrink-0 cursor-pointer transition-opacity hover:opacity-80'>
                <AvatarImage
                  src={profilePhotoUrl || undefined}
                  alt={fullName}
                />
                <AvatarFallback className='text-xs'>{initials}</AvatarFallback>
              </Avatar>
            }
          />
          <LongText className='max-w-35'>{username}</LongText>
        </div>
      )
    },
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)] lg:drop-shadow-none',
        'bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
        'sticky left-0 md:table-cell w-32'
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
    meta: { className: 'w-48' },
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
