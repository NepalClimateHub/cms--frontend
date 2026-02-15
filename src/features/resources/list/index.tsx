
import { Main } from '@/ui/layouts/main'
import PageHeader from '@/ui/page-header'
import { Button } from '@/ui/shadcn/button'
import { PlusIcon } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { usePagination } from '@/hooks/use-pagination'
import { useGetResources } from '@/query/resources/use-resources'
import { DataTable } from '@/ui/data-table/data-table'
import { useResourceColumns } from './components/columns'
import { DataTableToolbar } from '@/ui/data-table/data-table-toolbar'
import {
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from '@tanstack/react-table'

export default function ResourceList() {
  const navigate = useNavigate()
  const paginationOptions = usePagination()
  const { pagination } = paginationOptions
  const columns = useResourceColumns()

  const { data: resourcesData, isLoading } = useGetResources({
    ...pagination,
  })

  const resources = resourcesData?.data || []
  const total = resourcesData?.meta?.count || 0

  const table = useReactTable({
    data: resources,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(total / pagination.limit),
    state: {
      pagination: {
        pageIndex: Math.floor(pagination.offset / pagination.limit),
        pageSize: pagination.limit,
      },
    },
    onPaginationChange: (updater) => {
      let newPaginationState: { pageIndex: number; pageSize: number }
      if (typeof updater === 'function') {
        const currentState = {
          pageIndex: Math.floor(pagination.offset / pagination.limit),
          pageSize: pagination.limit,
        }
        newPaginationState = updater(currentState)
      } else {
        newPaginationState = updater
      }
      paginationOptions.setPagination({
        limit: newPaginationState.pageSize,
        offset: newPaginationState.pageIndex * newPaginationState.pageSize,
      })
    },
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
      <div className='mt-4'>
        <DataTableToolbar table={table} />
        <DataTable table={table} loading={isLoading} />
      </div>
    </Main>
  )
}
