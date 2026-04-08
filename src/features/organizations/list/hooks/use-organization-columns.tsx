import { ColumnDef } from '@tanstack/react-table'
import { OrganizationFormValues } from '@/schemas/organization/organization'
import { DataTableColumnHeader } from '../../../../ui/data-table/data-table-column-header'
import OrganizationRowAction from '../components/organization-row-actions'

export const useOrganizationColumns = () => {
  const columns: ColumnDef<OrganizationFormValues>[] = [
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
        <div>{row.original.email ?? '—'}</div>
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
        const phone =
          [phoneCountryCode, phoneNumber].filter(Boolean).join(' ') || '—'
        return <div>{phone}</div>
      },
    },
    {
      id: 'address',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Address' />
      ),
      cell: ({ row }) => <div>{row.getValue('address')}</div>,
    },
    {
      id: 'actions',
      cell: ({ row }) => <OrganizationRowAction row={row} />,
    },
  ]

  return columns
}
