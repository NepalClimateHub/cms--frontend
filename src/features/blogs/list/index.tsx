import { useNavigate } from '@tanstack/react-router'
import { getCoreRowModel } from '@tanstack/react-table'
import { useReactTable } from '@tanstack/react-table'
import { useGetBlogs } from '@/query/blogs/use-blogs'
import { BlogResponseDto } from '@/query/blogs/use-blogs'
import { Meta } from '@/schemas/shared'
import { DataTable } from '@/ui/data-table/data-table'
import { DataTablePagination } from '@/ui/data-table/data-table-pagination'
import { DataTableToolbar } from '@/ui/data-table/data-table-toolbar'
import { Main } from '@/ui/layouts/main'
import { BoxLoader } from '@/ui/loader'
import PageHeader from '@/ui/page-header'
import { Button } from '@/ui/shadcn/button'
import { PlusIcon } from 'lucide-react'
import { useFilters } from '@/hooks/use-filters'
import { usePagination } from '@/hooks/use-pagination'
import { blogsFilterOptions } from './blogs-filter-options'
import BlogsFilters from './components/blogs-filters'
import { useBlogsColumns } from './hooks/use-blog-columns'

const ListBlog = () => {
  const navigate = useNavigate()

  const blogsColumns = useBlogsColumns()
  const paginationOptions = usePagination()
  const filterOptions = useFilters(blogsFilterOptions)

  const { pagination, setPage } = paginationOptions
  const { filters } = filterOptions

  const { data: blogsList, isLoading: isLoadingBlogs } = useGetBlogs({
    ...pagination,
    ...filters,
  })

  const blogsData = (blogsList?.data ?? []) as unknown as BlogResponseDto[]
  const blogsMeta = blogsList?.meta as unknown as Meta

  const table = useReactTable({
    data: blogsData,
    columns: blogsColumns,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
  })

  if (isLoadingBlogs) {
    return <BoxLoader />
  }
  return (
    <Main>
      <PageHeader
        title='Blogs'
        description='Manage blogs for your content!'
        actions={
          <Button
            onClick={() => {
              navigate({
                to: '/blogs/add',
              })
            }}
          >
            {' '}
            <PlusIcon /> Add Blog
          </Button>
        }
      />

      <div className='mb-2 mt-4'>
        <DataTableToolbar
          table={table}
          filterComponent={
            <BlogsFilters filterOptions={filterOptions} setPage={setPage} />
          }
        />
      </div>
      <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
        <DataTable loading={isLoadingBlogs} table={table} />
      </div>
      <div className='mt-4'>
        <DataTablePagination
          totalCount={(blogsMeta?.count ?? 0) as number}
          paginationOptions={paginationOptions}
        />
      </div>
    </Main>
  )
}

export default ListBlog
