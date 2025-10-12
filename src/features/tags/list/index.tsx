import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Main } from '@/ui/layouts/main'
import { tagControllerGetTagsOptions } from '@/api/@tanstack/react-query.gen'
import { TagOutputDto } from '@/api/types.gen'
import { useFilters } from '@/hooks/use-filters'
import { usePagination } from '@/hooks/use-pagination'
import { DataTable } from '@/ui/data-table/data-table'
import { BoxLoader } from '@/ui/loader'
import PageHeader from '@/ui/page-header'
import { DataTablePagination } from '../../../ui/data-table/data-table-pagination'
import { DataTableToolbar } from '../../../ui/data-table/data-table-toolbar'
import { AddTagDialog } from '../add/add-tag-dialog'
import TagsFilters from './components/tag-filters'
import { TagsListActionButtons } from './components/tags-list-action-buttons'
import { useTagsColumns } from './hooks/use-tags-columns'
import { tagsFilterOptions } from './tags-filter-options'

export default function Tags() {
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  const tagColumns = useTagsColumns()
  const paginationOptions = usePagination()
  const filterOptions = useFilters(tagsFilterOptions)

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

  const tagsData = data?.data ?? []
  const tagsMeta = data?.meta ?? {}

  const table = useReactTable({
    data: tagsData,
    columns: tagColumns as ColumnDef<TagOutputDto, unknown>[],
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
            totalCount={(tagsMeta.count ?? 0) as number}
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
