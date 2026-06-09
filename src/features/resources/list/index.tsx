import { Main } from '@/ui/layouts/main'
import PageHeader from '@/ui/page-header'
import { Button } from '@/ui/shadcn/button'
import { PlusIcon } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { usePagination } from '@/hooks/use-pagination'
import { useGetResources, ResourceType } from '@/query/resources/use-resources'
import { DataTable } from '@/ui/molecules/data-table/data-table'
import { useResourceColumns } from './components/columns'
import { DataTableToolbar } from '@/ui/molecules/data-table/data-table-toolbar'
import {
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useFilters } from '@/hooks/use-filters'
import { parseAsArrayOf, parseAsString } from 'nuqs'
import { MultiSelect } from '@/ui/multi-select'
import { useEffect, useState } from 'react'
import { Input } from '@/ui/shadcn/input'


export default function ResourceList() {
  const navigate = useNavigate()
  const paginationOptions = usePagination()
  const filterOptions = useFilters({
    title: parseAsString,
    type: parseAsArrayOf(parseAsString),
  })

  const { pagination, setPage } = paginationOptions
  const { filters, setFilterDebounce, setFilterValue } = filterOptions

  const [searchTerm, setSearchTerm] = useState((filters.title as string) ?? '')

  useEffect(() => {
    setSearchTerm((filters.title as string) ?? '')
  }, [filters.title])

  useEffect(() => {
    setPage(1)
  }, [filters])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setFilterDebounce('title', value)
  }

  const columns = useResourceColumns()

  const { data: resourcesData, isLoading } = useGetResources({
    ...pagination,
    ...filters,
  })

  const resources = resourcesData?.data || []
  const total = resourcesData?.meta?.count || 0

  const table = useReactTable({
    data: resources,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: total,
  })

  return (
    <Main>
      <PageHeader
        title='Resources'
        description='Manage your resources library'
        actions={
          <Button onClick={() => navigate({ to: '/resources/add' })}>
            <PlusIcon className='mr-2 h-4 w-4' /> Add Resource
          </Button>
        }
      />
      <div className='mt-4 space-y-4'>
        <DataTableToolbar
          table={table}
          filterComponent={
            <div className='flex items-center space-x-2'>
              <Input
                placeholder='Search resources...'
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className='h-8 w-[150px] lg:w-[250px]'
              />
              <MultiSelect
                options={Object.values(ResourceType).map((type) => ({
                  label: type.replace(/_/g, ' ').toLowerCase(),
                  value: type,
                }))}
                onValueChange={(values) => setFilterValue('type', values)}
                defaultValue={(filters.type as string[]) ?? []}
                placeholder='All Types'
                className='h-8 min-h-8 w-[200px] lg:w-[300px]'
                maxCount={2}
              />
            </div>
          }
        />
        <DataTable table={table} loading={isLoading} />
      </div>
    </Main>
  )
}
