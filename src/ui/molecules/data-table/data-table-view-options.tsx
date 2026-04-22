import { isValidElement, type ReactNode } from 'react'
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { MixerHorizontalIcon } from '@radix-ui/react-icons'
import type { HeaderContext, Table } from '@tanstack/react-table'
import { Button } from '@/ui/shadcn/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/ui/shadcn/dropdown-menu'

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>
}

function columnHeaderLabel<TData>(
  table: Table<TData>,
  column: ReturnType<Table<TData>['getAllColumns']>[number]
): ReactNode {
  const header = column.columnDef.header
  if (typeof header !== 'function') {
    return header ?? column.id
  }
  const ctx = {
    column,
    header: column.columnDef,
    table,
  } as HeaderContext<TData, unknown>
  const node = header(ctx)
  if (
    isValidElement(node) &&
    node.props &&
    typeof node.props === 'object' &&
    node.props !== null &&
    'title' in node.props
  ) {
    return (node.props as { title: ReactNode }).title
  }
  return column.id
}

export function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className='ml-auto hidden h-8 lg:flex'
        >
          <MixerHorizontalIcon className='mr-2 h-4 w-4' />
          View
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[150px]'>
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== 'undefined' && column.getCanHide()
          )
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className='capitalize'
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {columnHeaderLabel(table, column)}
              </DropdownMenuCheckboxItem>
            )
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
