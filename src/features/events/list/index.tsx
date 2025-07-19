import { useNavigate } from '@tanstack/react-router'
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useGetEvents } from '@/query/events/use-events'
import { Main } from '@/ui/layouts/main'
import { Button } from '@/ui/shadcn/button'
import { PlusIcon } from 'lucide-react'
import { EventResponseDto } from '@/api/types.gen'
import { useFilters } from '@/hooks/use-filters'
import { usePagination } from '@/hooks/use-pagination'
import { DataTable } from '@/components/data-table/data-table'
import { BoxLoader } from '@/components/loader'
import PageHeader from '@/components/page-header'
import { DataTablePagination } from '../../../components/data-table/data-table-pagination'
import { DataTableToolbar } from '../../../components/data-table/data-table-toolbar'
import EventsFilters from './components/event-filters'
import { eventsFilterOptions } from './events-filter-options'
import { useEventsColumns } from './hooks/use-events-columns'

export default function ListEvents() {
  const navigate = useNavigate()
  const eventsCols = useEventsColumns()
  const paginationOptions = usePagination()
  const filterOptions = useFilters(eventsFilterOptions)

  const { pagination, setPage } = paginationOptions
  const { filters } = filterOptions

  const { data, isLoading } = useGetEvents({
    ...pagination,
    ...filters,
  })

  const eventsData = data?.data ?? []
  const eventsMeta = data?.meta ?? { count: 0 }

  const table = useReactTable({
    data: eventsData,
    // @ts-expect-error - TODO: check type
    columns: eventsCols as ColumnDef<EventResponseDto>[],
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
  })

  if (isLoading) {
    return <BoxLoader />
  }

  return (
    <>
      <Main>
        <PageHeader
          title='Events'
          description='Manage events !'
          actions={
            <div className='flex items-center space-x-2'>
              <Button
                onClick={() => {
                  navigate({
                    to: '/events/add',
                  })
                }}
              >
                {' '}
                <PlusIcon /> Add Event
              </Button>
            </div>
          }
        />
        <div className='mb-2 mt-4'>
          <DataTableToolbar
            table={table}
            filterComponent={
              <EventsFilters filterOptions={filterOptions} setPage={setPage} />
            }
          />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
          <DataTable loading={isLoading} table={table} />
        </div>
        <div className='mt-4'>
          <DataTablePagination
            totalCount={eventsMeta.count as unknown as number}
            paginationOptions={paginationOptions}
          />
        </div>
      </Main>
    </>
  )
}
