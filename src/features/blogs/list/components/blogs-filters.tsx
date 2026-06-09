import { FC, useEffect, useState } from 'react'
import { Input } from '@/ui/shadcn/input'
import { Checkbox } from '@/ui/shadcn/checkbox'
import { Label } from '@/ui/shadcn/label'
import { Separator } from '@/ui/shadcn/separator'
import { useFilters } from '@/hooks/use-filters'
import { useIsFirstRender } from '@/hooks/use-first-render'

type BlogsFiltersProps = {
  setPage: (page: number | string) => void
  filterOptions: ReturnType<typeof useFilters>
}

const BlogsFilters: FC<BlogsFiltersProps> = ({ setPage, filterOptions }) => {
  const isFirstRender = useIsFirstRender()
  const [search, setSearch] = useState<string>('')

  const { filters, setFilterDebounce, setFilterValue, removeFilter } =
    filterOptions

  useEffect(() => {
    if (!isFirstRender) {
      setPage(1)
    }
  }, [filters])

  useEffect(() => {
    setSearch((filters?.title as string) ?? '')
  }, [filters])

  // Persist includeDrafts state in localStorage
  useEffect(() => {
    const stored = localStorage.getItem('blog-include-drafts')
    if (stored !== null && filters.includeDrafts === undefined) {
      setFilterValue('includeDrafts', stored === 'true')
    }
  }, [setFilterValue, filters.includeDrafts])

  const handleSearch = (value: string) => {
    setSearch(value)
    if (value) {
      setFilterDebounce('title', value)
    } else {
      removeFilter('title')
    }
  }

  const handleDraftToggle = (checked: boolean) => {
    localStorage.setItem('blog-include-drafts', String(checked))
    setFilterValue('includeDrafts', checked)
  }

  return (
    <div className='flex flex-1 items-center justify-between gap-4'>
      <Input
        placeholder='Search Blogs...'
        value={search}
        onChange={(event) => handleSearch(event.target.value)}
        className='h-8 w-[150px] lg:w-[250px]'
      />

      <div className='flex items-center gap-4'>
        <div className='flex items-center space-x-2'>
          <Checkbox
            id='include-drafts'
            checked={!!filters.includeDrafts}
            onCheckedChange={(checked) => handleDraftToggle(checked as boolean)}
          />
          <Label
            htmlFor='include-drafts'
            className='cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
          >
            Include Drafts
          </Label>
        </div>
        <Separator orientation='vertical' className='h-4' />
      </div>
    </div>
  )
}

export default BlogsFilters
