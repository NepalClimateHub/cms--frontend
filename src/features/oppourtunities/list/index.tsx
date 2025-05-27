import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { getCoreRowModel } from '@tanstack/react-table'
import { useReactTable } from '@tanstack/react-table'
import { useGetOpportunity } from '@/query/opportunities/use-opportunities'
import { Meta } from '@/schemas/shared'
import { PlusIcon } from 'lucide-react'
import { opportunityControllerGetOpportunitiesOptions } from '@/api/@tanstack/react-query.gen'
import { OpportunityResponseDto } from '@/api/types.gen'
import { useFilters } from '@/hooks/use-filters'
import { usePagination } from '@/hooks/use-pagination'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table/data-table'
import { DataTablePagination } from '@/components/data-table/data-table-pagination'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { Main } from '@/components/layout/main'
import { BoxLoader } from '@/components/loader'
import PageHeader from '@/components/page-header'
import OpportunitiesFilters from './components/opportunities-filters'
import { useOpportunitiesColumns } from './hooks/use-opportunity-columns'
import { opportunitiesFilterOptions } from './opportunities-filter-options'

const ListOpportunity = () => {
  const navigate = useNavigate()

  // const [addDialogOpen, setAddDialogOpen] = useState(false)

  const opportunitiesColumns = useOpportunitiesColumns()
  const paginationOptions = usePagination()
  const filterOptions = useFilters(opportunitiesFilterOptions)

  const { pagination, setPage } = paginationOptions
  const { filters } = filterOptions

  // const { data, isLoading } = useQuery({
  //   ...tagControllerGetTagsOptions({
  //     query: {
  //       isOpportunityTag: true,
  //     },
  //   }),
  // })

  // const tagsOptions = data?.data?.map((tag) => ({
  //   value: tag.id,
  //   label: tag.tag,
  // }))

  const { data: opportunitiesList, isLoading: isLoadingOpportunities } =
    useGetOpportunity(pagination, filters)

  const opportunitiesData =
    opportunitiesList?.data as unknown as OpportunityResponseDto[]
  const opportunitiesMeta = opportunitiesList?.meta as unknown as Meta

  const table = useReactTable({
    data: opportunitiesData,
    columns: opportunitiesColumns,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
  })

  if (isLoadingOpportunities) {
    return <BoxLoader />
  }
  return (
    <Main>
      <PageHeader
        title='Opportunities'
        description='Manage opportunities for your resources!'
        actions={
          <Button
            onClick={() => {
              navigate({
                to: '/opportunities/add',
              })
            }}
          >
            {' '}
            <PlusIcon /> Add Opportunity
          </Button>
        }
      />

      <div className='mb-2 mt-4'>
        <DataTableToolbar
          table={table}
          filterComponent={
            <OpportunitiesFilters
              filterOptions={filterOptions}
              setPage={setPage}
            />
          }
        />
      </div>
      <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
        <DataTable loading={isLoadingOpportunities} table={table} />
      </div>
      <div className='mt-4'>
        <DataTablePagination
          totalCount={(opportunitiesMeta?.count ?? 0) as number}
          paginationOptions={paginationOptions}
        />
      </div>
    </Main>
  )
}

export default ListOpportunity
