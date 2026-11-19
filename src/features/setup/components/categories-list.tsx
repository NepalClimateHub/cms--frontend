import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useFilters } from '@/hooks/use-filters'
import { usePagination } from '@/hooks/use-pagination'
import { useGetCategories } from '@/query/categories/use-categories'
import { BoxLoader } from '@/ui/loader'
import { DataTable } from '@/ui/molecules/data-table/data-table'
import { DataTablePagination } from '@/ui/molecules/data-table/data-table-pagination'
import { DataTableToolbar } from '@/ui/molecules/data-table/data-table-toolbar'
import { Button } from '@/ui/shadcn/button'
import { useCategoryColumns } from '../hooks/use-category-columns'
import { AddCategoryDialog } from './add-category-dialog'

export default function CategoriesList() {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const columns = useCategoryColumns()
  const paginationOptions = usePagination()
  const { pagination } = paginationOptions
  const filterOptions = useFilters({})
  const { filters } = filterOptions

  const { data, isLoading } = useGetCategories({
    offset: pagination.offset,
    limit: pagination.limit,
    ...filters,
  })

  const categories = data?.data || []
  const total = data?.meta?.total || 0

  const table = useReactTable({
    data: categories,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  })

  if (isLoading) return <BoxLoader />

  return (
    <div className='px-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Categories</h2>
          <p className='text-muted-foreground'>
            Manage categories for your content (Blogs, News, etc.)
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className='mr-2 h-4 w-4' /> Add Category
        </Button>
      </div>

      <div className='mt-4'>
        <DataTableToolbar table={table} />
        <DataTable loading={isLoading} table={table} />
        <div className='mt-4'>
          <DataTablePagination
            totalCount={total}
            paginationOptions={paginationOptions}
          />
        </div>
      </div>

      <AddCategoryDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
      />
    </div>
  )
}
