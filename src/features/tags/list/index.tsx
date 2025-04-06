import { useState } from 'react'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useGetTags } from '@/query/tags/use-tags'
import { useFilters } from '@/hooks/use-filters'
import { usePagination } from '@/hooks/use-pagination'
import { DataTable } from '@/components/data-table/data-table'
import { Main } from '@/components/layout/main'
import { BoxLoader } from '@/components/loader'
import PageHeader from '@/components/page-header'
import { DataTablePagination } from '../../../components/data-table/data-table-pagination'
import { DataTableToolbar } from '../../../components/data-table/data-table-toolbar'
import { AddTagDialog } from '../add/add-tag-dialog'
import TagsFilters from './components/tag-filters'
import { TagsListActionButtons } from './components/tags-list-action-buttons'
import { useTagsColumns } from './hooks/use-tags-columns'
import { tagsFilterOptions } from './tags-filter-options'

export default function Tags() {
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  const roleColumns = useTagsColumns()
  const paginationOptions = usePagination()
  const filterOptions = useFilters(tagsFilterOptions)

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
          title='Tags'
          description='Manage tags for your resources!'
          actions={
            <TagsListActionButtons setAddDialogOpen={setAddDialogOpen} />
          }
        />
        <div className='mb-2 mt-4'>
          <DataTableToolbar
            table={table}
            filterComponent={
              <TagsFilters filterOptions={filterOptions} setPage={setPage} />
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
      <AddTagDialog
        open={addDialogOpen}
        onClose={() => {
          setAddDialogOpen(false)
        }}
      />
    </>
  )
}
