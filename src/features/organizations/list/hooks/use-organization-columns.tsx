import { ColumnDef } from '@tanstack/react-table'
import type { OrganizationResponseDto } from '@/api/types.gen'
import { DataTableColumnHeader } from '@/ui/molecules/data-table/data-table-column-header'
import OrganizationRowAction from '../components/organization-row-actions'

function formatOrgAddress(org: OrganizationResponseDto): string {
  const a = org.address
  if (!a) return '—'
  const parts = [a.street, a.city, a.state, a.postcode, a.country].filter(
    (p): p is string => typeof p === 'string' && p.trim() !== ''
  )
  return parts.length ? parts.join(', ') : '—'
}

export const useOrganizationColumns = () => {
  const columns: ColumnDef<OrganizationResponseDto>[] = [
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
      accessorKey: 'description',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Type' />
      ),
      cell: ({ row }) => {
        const { description } = row.original

        return (
          <div className='flex space-x-2'>
            <div>{description}</div>
          </div>
        )
      },
      enableSorting: false,
      enableHiding: true,
    },
    {
      id: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Email' />
      ),
      cell: ({ row }) => (
        <div>
          {typeof row.original.email === 'string'
            ? row.original.email
            : '—'}
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'phone',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Phone' />
      ),
      cell: ({ row }) => {
        const { phoneCountryCode, phoneNumber } = row.original
        const code =
          typeof phoneCountryCode === 'string' ? phoneCountryCode : ''
        const num = typeof phoneNumber === 'string' ? phoneNumber : ''
        const phone = [code, num].filter(Boolean).join(' ') || '—'
        return <div>{phone}</div>
      },
    },
    {
      id: 'address',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Address' />
      ),
      cell: ({ row }) => <div>{formatOrgAddress(row.original)}</div>,
    },
    {
      id: 'actions',
      cell: ({ row }) => <OrganizationRowAction row={row} />,
    },
  ]

  return columns
}
