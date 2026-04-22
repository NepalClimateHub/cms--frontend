import { Table } from '@tanstack/react-table'
import { DataTableViewOptions } from './data-table-view-options'

interface DataTableToolbarProps<TData> {
  filterComponent?: React.ReactNode
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  filterComponent,
  table,
}: DataTableToolbarProps<TData>) {

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        {
          filterComponent ? filterComponent : null
        }
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}