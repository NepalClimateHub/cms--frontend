import { FC, useEffect, useRef, useState } from 'react'
import { Cross2Icon } from '@radix-ui/react-icons'
import { cleanObj } from '@/utils/obj-utils'
import { useFilters } from '@/hooks/use-filters'
import { useIsFirstRender } from '@/hooks/use-first-render'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type NewsListFiltersProps = {
  setPage: (page: number | string) => void
  filterOptions: ReturnType<typeof useFilters>
}

const NewsListFilters: FC<NewsListFiltersProps> = ({
  setPage,
  filterOptions,
}) => {
  const isFirstRender = useIsFirstRender()
  const [search, setSearch] = useState<string>('')

  const searchRef = useRef<HTMLInputElement>(null)

  const { filters, setFilterDebounce, removeFilter, resetFilters } =
    filterOptions

  const isFilterApplied = !!Object.keys(cleanObj(filters)).length

  useEffect(() => {
    if (!isFirstRender) {
      setPage(1)
    }
  }, [filters])

  useEffect(() => {
    setSearch((filters?.title as string) ?? '')
    if (filters?.title) {
      searchRef.current?.focus()
    }
  }, [filters])

  const handleSearch = (value: string) => {
    setSearch(value)
    if (value) {
      setFilterDebounce('title', value)
    } else {
      removeFilter('title')
    }
  }

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        <Input
          placeholder='Search News...'
          value={search}
          ref={searchRef}
          onChange={(event) => handleSearch(event.target.value)}
          className='h-8 w-[150px] lg:w-[250px]'
        />
        {isFilterApplied && (
          <Button
            variant='ghost'
            onClick={resetFilters}
            className='h-8 px-2 lg:px-3'
          >
            Reset
            <Cross2Icon className='ml-2 h-4 w-4' />
          </Button>
        )}
      </div>
    </div>
  )
}

export default NewsListFilters
