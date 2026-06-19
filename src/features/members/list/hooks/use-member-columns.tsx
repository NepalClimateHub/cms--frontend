import { ColumnDef } from '@tanstack/react-table'
import { MemberResponseDto } from '@/query/members/use-members'
import { DataTableColumnHeader } from '@/ui/molecules/data-table/data-table-column-header'
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/shadcn/avatar'
import { Badge } from '@/ui/shadcn/badge'
import MemberRowActions from '../components/member-row-actions'

export const useMemberColumns = (): ColumnDef<MemberResponseDto>[] => {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Name' />
      ),
      cell: ({ row }) => {
        const photoUrl = row.original.photoUrl
        const name = row.getValue('name') as string
        const initials = name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()

        return (
          <div className='flex items-center gap-3'>
            <Avatar className='h-8 w-8 border border-border'>
              {photoUrl && <AvatarImage src={photoUrl} alt={name} />}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span className='font-medium text-foreground'>{name}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Email' />
      ),
      cell: ({ row }) => {
        return (
          <span className='text-muted-foreground'>{row.getValue('email')}</span>
        )
      },
    },
    {
      accessorKey: 'role',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Role' />
      ),
      cell: ({ row }) => {
        return <span className='font-medium'>{row.getValue('role')}</span>
      },
    },
    {
      accessorKey: 'team',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Team' />
      ),
      cell: ({ row }) => {
        return <Badge variant='outline'>{row.getValue('team')}</Badge>
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Status' />
      ),
      cell: ({ row }) => {
        return <Badge variant='secondary'>{row.getValue('status')}</Badge>
      },
    },
    {
      accessorKey: 'isActive',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Status' />
      ),
      cell: ({ row }) => {
        const isActive = row.getValue('isActive') as boolean
        return (
          <Badge
            variant={isActive ? 'default' : 'destructive'}
            className={
              isActive ? 'bg-green-500 text-white hover:bg-green-600' : ''
            }
          >
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'order',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Order' />
      ),
      cell: ({ row }) => {
        return (
          <span className='font-mono text-muted-foreground'>
            {row.getValue('order')}
          </span>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => <MemberRowActions member={row.original} />,
    },
  ]
}
