import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { PlusIcon } from 'lucide-react'
import { useFilters } from '@/hooks/use-filters'
import { usePagination } from '@/hooks/use-pagination'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table/data-table'
import { DataTablePagination } from '@/components/data-table/data-table-pagination'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { Main } from '@/components/layout/main'
import { BoxLoader } from '@/components/loader'
import PageHeader from '@/components/page-header'
import NewsListFilters from './components/news-filters'
import { useNewsColumns } from './hooks/use-news-columns'
import { NewsListFilterOptions } from './news-filter-options'

export default function NewsList() {
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  const navigate = useNavigate()
  const roleColumns = useNewsColumns()
  const paginationOptions = usePagination()
  const filterOptions = useFilters(NewsListFilterOptions)

  const { pagination, setPage } = paginationOptions
  const { filters } = filterOptions

  const { data, isLoading } = useGetTags({
    ...pagination,
    ...filters,
  })

  const roleData = data?.data!
  const roleMeta = data?.meta!

  const table = useReactTable({
    data: roleData,
    columns: roleColumns,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
  })

  if (isLoading) {
    return <BoxLoader />
  }

  return (
    <Main>
      <PageHeader
        title='News'
        description='Manage news!'
        actions={
          <div className='flex items-center space-x-2'>
            <Button
              onClick={() => {
                navigate({
                  to: '/news/add',
                })
              }}
            >
              <PlusIcon /> Add News
            </Button>
          </div>
        }
      />
      <div className='mb-2 mt-4'>
        <DataTableToolbar
          table={table}
          filterComponent={
            <NewsListFilters filterOptions={filterOptions} setPage={setPage} />
          }
        />
      </div>
      <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
        <DataTable loading={isLoading} table={table} />
      </div>
      <div className='mt-4'>
        <DataTablePagination
          totalCount={roleMeta.count}
          paginationOptions={paginationOptions}
        />
      </div>
    </Main>
  )
}
