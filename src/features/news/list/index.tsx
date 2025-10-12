import { useNavigate } from '@tanstack/react-router'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useGetNews } from '@/query/news/use-news'
import { Main } from '@/ui/layouts/main'
import { Button } from '@/ui/shadcn/button'
import { PlusIcon } from 'lucide-react'
import { useFilters } from '@/hooks/use-filters'
import { usePagination } from '@/hooks/use-pagination'
import { DataTable } from '@/ui/data-table/data-table'
import { DataTablePagination } from '@/ui/data-table/data-table-pagination'
import { DataTableToolbar } from '@/ui/data-table/data-table-toolbar'
import { BoxLoader } from '@/ui/loader'
import PageHeader from '@/ui/page-header'
import NewsListFilters from './components/news-filters'
import { useNewsColumns } from './hooks/use-news-columns'
import { NewsListFilterOptions } from './news-filter-options'

export default function NewsList() {
  const navigate = useNavigate()
  const newsColumns = useNewsColumns()
  const paginationOptions = usePagination()
  const filterOptions = useFilters(NewsListFilterOptions)

  const { pagination, setPage } = paginationOptions
  const { filters } = filterOptions

  const { data, isLoading } = useGetNews({
    ...pagination,
    ...filters,
  })

  const newsData = data?.data ?? []
  const newsMeta = {
    count: typeof data?.meta?.count === 'number' ? data.meta.count : 0,
  }

  const table = useReactTable({
    data: newsData,
    columns: newsColumns,
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
          totalCount={newsMeta.count}
          paginationOptions={paginationOptions}
        />
      </div>
    </Main>
  )
}
