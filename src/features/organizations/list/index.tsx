import { useQuery } from '@tanstack/react-query'
import { getCoreRowModel } from '@tanstack/react-table'
import { useReactTable } from '@tanstack/react-table'
import { Meta } from '@/schemas/shared'
import { tagControllerGetTagsOptions } from '@/api/@tanstack/react-query.gen'
import { OrganizationResponseDto } from '@/api/types.gen'
import { useFilters } from '@/hooks/use-filters'
import { usePagination } from '@/hooks/use-pagination'
import { DataTable } from '@/components/data-table/data-table'
import { DataTablePagination } from '@/components/data-table/data-table-pagination'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { Main } from '@/components/layout/main'
import { BoxLoader } from '@/components/loader'
import PageHeader from '@/components/page-header'
import OrganizationFilters from './components/organization-filters'
import { useOrganizationColumns } from './hooks/use-organization-columns'

const ListOrganizations = () => {
  const roleColumns = useOrganizationColumns()
  const paginationOptions = usePagination()
  // @ts-expect-error - TODO: check type
  const filterOptions = useFilters(OrganizationFilters)

  const { pagination, setPage } = paginationOptions
  const { filters } = filterOptions

  const { data, isLoading } = useQuery({
    ...tagControllerGetTagsOptions({
      query: {
        ...pagination,
        ...filters,
      },
    }),
  })

  const roleData = data?.data as unknown as OrganizationResponseDto[]
  const roleMeta = data?.meta as unknown as Meta

  const table = useReactTable({
    data: roleData,
    // @ts-expect-error - TODO: check type
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
        title='Organizations'
        description='Manage organizations for your resources!'
      />
      <div className='mb-2 mt-4'>
        <DataTableToolbar
          table={table}
          filterComponent={
            <OrganizationFilters
              filterOptions={filterOptions}
              setPage={setPage}
            />
          }
        />
      </div>
      <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
        <DataTable loading={isLoading} table={table} />
      </div>
      <div className='mt-4'>
        <DataTablePagination
          totalCount={(roleMeta.count ?? 0) as number}
          paginationOptions={paginationOptions}
        />
      </div>
    </Main>
  )
}

export default ListOrganizations
