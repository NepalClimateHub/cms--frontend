import { ColumnDef } from '@tanstack/react-table'
import { OpportunityFormValues } from '@/schemas/opportunities/opportunities'
import { DataTableColumnHeader } from '../../../../components/data-table/data-table-column-header'
import OpportunitiesRowAction from '../components/opportunity-row-actions'

export const useOpportunitiesColumns = () => {
  const columns: ColumnDef<OpportunityFormValues>[] = [
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
        <DataTableColumnHeader column={column} title='Description' />
      ),
      cell: ({ row }) => {
        const { description } = row.original

        console.log(row.original)

        return <div className='flex space-x-2'>{description}</div>
      },
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: 'address',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Address' />
      ),
      cell: ({ row }) => <div>{row.getValue('address')}</div>,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'tags',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Tags' />
      ),
      cell: ({ row }) => <div>{row.getValue('tags')}</div>,
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'actions',
      cell: ({ row }) => <OpportunitiesRowAction row={row} />,
    },
  ]

  return columns
}
