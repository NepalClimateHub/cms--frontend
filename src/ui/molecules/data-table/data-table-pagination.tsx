import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons'
import { Button } from '@/ui/shadcn/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/shadcn/select'
import { usePagination } from '@/hooks/use-pagination'

interface DataTablePaginationProps {
  totalCount: number
  paginationOptions: ReturnType<typeof usePagination>
  pageSizeOptions?: number[]
}

export function DataTablePagination({
  totalCount,
  paginationOptions,
  pageSizeOptions = [10, 20, 30, 40, 50],
}: DataTablePaginationProps) {
  const {
    pagination,
    currentPage,
    setLimit,
    setNextPage,
    setPage,
    setPrevPage,
  } = paginationOptions

  const { limit, offset } = pagination
  const totalPages = Math.floor(totalCount / limit)
  const isFirstPage = offset === 0
  const isLastPage = offset === totalPages * (limit - 1)

  return (
    <div
      className='flex items-center justify-end overflow-clip px-2'
      style={{ overflowClipMargin: 1 }}
    >
      <div className='flex items-center sm:space-x-6 lg:space-x-8'>
        <div className='flex items-center space-x-2'>
          <p className='hidden text-sm font-medium sm:block'>Rows per page</p>
          <Select
            value={String(limit)}
            onValueChange={(value) => {
              setLimit(value)
            }}
          >
            <SelectTrigger className='h-8 w-[70px]'>
              <SelectValue placeholder={limit} />
            </SelectTrigger>
            <SelectContent side='top'>
              {pageSizeOptions.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='flex w-[100px] items-center justify-center text-sm font-medium'>
          Page {currentPage} of {totalPages === 0 ? 1 : totalPages}
        </div>
        <div className='flex items-center space-x-2'>
          <Button
            variant='outline'
            className='hidden h-8 w-8 p-0 lg:flex'
            onClick={() => setPage(1)}
            disabled={isFirstPage}
          >
            <span className='sr-only'>Go to first page</span>
            <DoubleArrowLeftIcon className='h-4 w-4' />
          </Button>

          <Button
            variant='outline'
            className='h-8 w-8 p-0'
            onClick={() => setPrevPage()}
            disabled={isFirstPage}
          >
            <span className='sr-only'>Go to previous page</span>
            <ChevronLeftIcon className='h-4 w-4' />
          </Button>

          <Button
            variant='outline'
            className='h-8 w-8 p-0'
            onClick={() => setNextPage()}
            disabled={isLastPage}
          >
            <span className='sr-only'>Go to next page</span>
            <ChevronRightIcon className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            className='hidden h-8 w-8 p-0 lg:flex'
            onClick={() => setPage(totalPages)}
            disabled={isLastPage}
          >
            <span className='sr-only'>Go to last page</span>
            <DoubleArrowRightIcon className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </div>
  )
}
