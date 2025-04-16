import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useGetTags } from '@/query/tags/use-tags'
import { PlusIcon } from 'lucide-react'
import { useFilters } from '@/hooks/use-filters'
import { usePagination } from '@/hooks/use-pagination'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table/data-table'
import { Main } from '@/components/layout/main'
import { BoxLoader } from '@/components/loader'
import PageHeader from '@/components/page-header'
import { DataTablePagination } from '../../../components/data-table/data-table-pagination'
import { DataTableToolbar } from '../../../components/data-table/data-table-toolbar'
import EventsFilters from './components/event-filters'
import { EventsListActionButtons } from './components/event-list-action-buttons'
import { eventsFilterOptions } from './events-filter-options'
import { useEventsColumns } from './hooks/use-events-columns'

export default function ListEvents() {
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  const navigate = useNavigate()
  const roleColumns = useEventsColumns()
  const paginationOptions = usePagination()
  const filterOptions = useFilters(eventsFilterOptions)

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
            totalCount={roleMeta.count}
            paginationOptions={paginationOptions}
          />
        </div>
      </Main>
    </>
  )
}
