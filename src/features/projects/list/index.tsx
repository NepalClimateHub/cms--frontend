
import { useNavigate } from '@tanstack/react-router'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { FC, useEffect, useState } from 'react'
import { useGetProjects, ProjectResponseDto } from '@/query/projects/use-projects'
import { DataTable } from '@/ui/data-table/data-table'
import { DataTablePagination } from '@/ui/data-table/data-table-pagination'
import { DataTableToolbar } from '@/ui/data-table/data-table-toolbar'
import { Main } from '@/ui/layouts/main'
import { BoxLoader } from '@/ui/loader'
import PageHeader from '@/ui/page-header'
import { Button } from '@/ui/shadcn/button'
import { PlusIcon } from 'lucide-react'
import { usePagination } from '@/hooks/use-pagination'
import { useProjectColumns } from './hooks/use-project-columns'
import { useFilters } from '@/hooks/use-filters'
import { Input } from '@/ui/shadcn/input'
import { parseAsString } from 'nuqs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/shadcn/select'

const ProjectList = () => {
  const navigate = useNavigate()
  const columns = useProjectColumns()
  const paginationOptions = usePagination()
  const filterOptions = useFilters({
    title: parseAsString,
    status: parseAsString,
  })

  const { pagination } = paginationOptions
  const { filters, setFilterDebounce, setFilterValue } = filterOptions

  const [searchTerm, setSearchTerm] = useState((filters.title as string) ?? '')

  useEffect(() => {
    setSearchTerm((filters.title as string) ?? '')
  }, [filters.title])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setFilterDebounce('title', value)
  }

  const { data: projectsList, isLoading } = useGetProjects({
    ...pagination,
    ...filters,
  })

  // Adapt response to array
  const projectsData = (projectsList?.data ?? []) as ProjectResponseDto[]
  const totalCount = projectsList?.meta?.count ?? 0

  const table = useReactTable({
    data: projectsData,
    columns,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    rowCount: totalCount,
  })

  if (isLoading) {
    return <BoxLoader />
  }

  return (
    <Main>
      <PageHeader
        title='Projects'
        description='Manage your projects (Work)'
        actions={
          <Button
            onClick={() => {
              navigate({
                to: '/projects/add',
              })
            }}
          >
            <PlusIcon className='mr-2 h-4 w-4' /> Add Project
          </Button>
        }
      />

      <div className='mb-2 mt-4'>
        <DataTableToolbar
          table={table}
          filterComponent={
            <div className='flex items-center space-x-2'>
              <Input
                placeholder='Search projects...'
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className='h-8 w-[150px] lg:w-[250px]'
              />
              <Select
                value={(filters.status as string) ?? 'ALL'}
                onValueChange={(value) =>
                  setFilterValue('status', value === 'ALL' ? null : value)
                }
              >
                <SelectTrigger className='h-8 w-[150px]'>
                  <SelectValue placeholder='Status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ALL'>All Statuses</SelectItem>
                  <SelectItem value='ONGOING'>Ongoing</SelectItem>
                  <SelectItem value='COMPLETED'>Completed</SelectItem>
                  <SelectItem value='UPCOMING'>Upcoming</SelectItem>
                </SelectContent>
              </Select>
            </div>
          }
        />
      </div>

      <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
        <DataTable loading={isLoading} table={table} />
      </div>

      <div className='mt-4'>
        <DataTablePagination
          totalCount={totalCount}
          paginationOptions={paginationOptions}
        />
      </div>
    </Main>
  )
}

export default ProjectList
