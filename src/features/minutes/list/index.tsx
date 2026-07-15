import { useNavigate } from '@tanstack/react-router'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useGetMinutes } from '@/query/minutes/use-minutes'
import { Main } from '@/ui/layouts/main'
import { Button } from '@/ui/shadcn/button'
import { PlusIcon } from 'lucide-react'
import { useFilters } from '@/hooks/use-filters'
import { usePagination } from '@/hooks/use-pagination'
import { DataTable } from '@/ui/molecules/data-table/data-table'
import { DataTablePagination } from '@/ui/molecules/data-table/data-table-pagination'
import { DataTableToolbar } from '@/ui/molecules/data-table/data-table-toolbar'
import { BoxLoader } from '@/ui/loader'
import PageHeader from '@/ui/page-header'
import MinutesListFilters from './components/minutes-filters'
import { useMinutesColumns } from './hooks/use-minutes-columns'
import { MinutesListFilterOptions } from './minutes-filter-options'

export default function MinutesList() {
  const navigate = useNavigate()
  const minutesColumns = useMinutesColumns()
  const paginationOptions = usePagination()
  const filterOptions = useFilters(MinutesListFilterOptions)

  const { pagination, setPage } = paginationOptions
  const { filters } = filterOptions

  const { data, isLoading } = useGetMinutes({
    ...pagination,
    ...filters,
  })

  const minutesData = data?.data ?? []
  const minutesMeta = {
    count: typeof data?.meta?.total === 'number' ? data.meta.total : 0,
  }

  const table = useReactTable({
    data: minutesData,
    columns: minutesColumns,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
  })

  if (isLoading) {
    return <BoxLoader />
  }

  return (
    <Main>
      <PageHeader
        title='Meeting Minutes'
        description='Manage meeting minutes records!'
        actions={
          <div className='flex items-center space-x-2'>
            <Button
              onClick={() => {
                navigate({
                  to: '/minutes/add',
                })
              }}
            >
              <PlusIcon /> Add Minutes
            </Button>
          </div>
        }
      />
      <div className='mb-2 mt-4'>
        <DataTableToolbar
          table={table}
          filterComponent={
            <MinutesListFilters filterOptions={filterOptions} setPage={setPage} />
          }
        />
      </div>
      <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
        <DataTable loading={isLoading} table={table} />
      </div>
      <div className='mt-4'>
        <DataTablePagination
          totalCount={minutesMeta.count}
          paginationOptions={paginationOptions}
        />
      </div>
    </Main>
  )
}
export { MinutesList }
