import { useEffect, useState, useRef, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  useGetTestimonials,
  useReorderTestimonials,
  TestimonialResponseDto,
} from '@/query/testimonials/use-testimonials'
import { Main } from '@/ui/layouts/main'
import { BoxLoader } from '@/ui/loader'
import { DataTablePagination } from '@/ui/molecules/data-table/data-table-pagination'
import PageHeader from '@/ui/page-header'
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/shadcn/avatar'
import { Badge } from '@/ui/shadcn/badge'
import { Button } from '@/ui/shadcn/button'
import { Input } from '@/ui/shadcn/input'
import { PlusIcon, GripVertical, Star, MessageSquareQuote } from 'lucide-react'
import { parseAsString } from 'nuqs'
import { useFilters } from '@/hooks/use-filters'
import { usePagination } from '@/hooks/use-pagination'
import TestimonialRowActions from './components/testimonial-row-actions'

const TestimonialList = () => {
  const navigate = useNavigate()
  const paginationOptions = usePagination()
  const filterOptions = useFilters({
    search: parseAsString,
  })

  const { pagination } = paginationOptions
  const { filters, setFilterDebounce } = filterOptions

  const [searchTerm, setSearchTerm] = useState((filters.search as string) ?? '')

  useEffect(() => {
    setSearchTerm((filters.search as string) ?? '')
  }, [filters.search])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setFilterDebounce('search', value)
  }

  const { data: testimonialsList, isLoading } = useGetTestimonials({
    ...pagination,
    ...filters,
  })

  const testimonialsData = useMemo(() => {
    return (testimonialsList?.data ?? []) as TestimonialResponseDto[]
  }, [testimonialsList?.data])
  const totalCount = testimonialsList?.meta?.count ?? 0

  const [localTestimonials, setLocalTestimonials] = useState<TestimonialResponseDto[]>([])
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const reorderTestimonialsMutation = useReorderTestimonials()

  useEffect(() => {
    if (testimonialsData) {
      setLocalTestimonials(testimonialsData)
    }
  }, [testimonialsData])

  const localTestimonialsRef = useRef(localTestimonials)
  useEffect(() => {
    localTestimonialsRef.current = localTestimonials
  }, [localTestimonials])

  const handleDragStart = (e: React.DragEvent, index: number) => {
    const target = e.target as HTMLElement
    if (
      target.closest('button') ||
      target.closest('a') ||
      target.closest('input') ||
      target.closest('[role="button"]')
    ) {
      e.preventDefault()
      return
    }
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const updated = [...localTestimonials]
    const [draggedItem] = updated.splice(draggedIndex, 1)
    updated.splice(index, 0, draggedItem)
    setLocalTestimonials(updated)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)

    const finalTestimonials = localTestimonialsRef.current
    const offset = pagination.offset ?? 0
    const reorderedOrders = finalTestimonials.map((item, idx) => ({
      id: item.id,
      order: offset + idx,
    }))

    reorderTestimonialsMutation.mutate(reorderedOrders)
  }

  return (
    <Main className='flex flex-col gap-4 pb-12 md:px-8'>
      <PageHeader
        title='Testimonials'
        description='Manage client & member testimonials'
        actions={
          <Button
            onClick={() => {
              navigate({
                to: '/testimonials/add',
              })
            }}
          >
            <PlusIcon className='mr-2 h-4 w-4' /> Add Testimonial
          </Button>
        }
      />

      <div className='mb-2 mt-4 flex flex-wrap items-center justify-between gap-4'>
        <div className='flex flex-wrap items-center gap-2'>
          <Input
            placeholder='Search testimonials...'
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className='h-9 w-[180px] lg:w-[280px]'
          />
        </div>
      </div>

      <div className='flex-1 overflow-y-auto py-2'>
        {isLoading ? (
          <BoxLoader />
        ) : localTestimonials.length > 0 ? (
          <div className='flex flex-col gap-3'>
            {localTestimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`group flex cursor-grab items-center gap-4 rounded-xl border border-border/50 bg-card/45 p-4 shadow-sm backdrop-blur transition-all duration-300 hover:border-primary/45 hover:shadow-md active:cursor-grabbing ${draggedIndex === index
                    ? 'scale-[0.99] border-dashed border-primary bg-accent/20 opacity-30'
                    : ''
                  }`}
              >
                {/* Drag Handle */}
                <div className='flex-shrink-0 text-muted-foreground/40 transition-colors duration-200 group-hover:text-muted-foreground'>
                  <GripVertical className='h-4 w-4' />
                </div>

                <div className='flex min-w-0 flex-1 flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4'>
                  {/* Left Section: Photo, Name, Rating */}
                  <div className='flex min-w-0 items-center gap-3 md:w-1/3'>
                    <Avatar className='h-12 w-12 flex-shrink-0 border border-border/60 bg-muted shadow-inner transition-transform duration-300 group-hover:scale-105'>
                      {testimonial.photoUrl ? (
                        <AvatarImage
                          src={testimonial.photoUrl}
                          alt={testimonial.name}
                          className='object-cover'
                        />
                      ) : null}
                      <AvatarFallback className='bg-primary/5 text-sm font-bold text-primary'>
                        {testimonial.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className='min-w-0 flex-1'>
                      <h3 className='truncate text-sm font-bold text-foreground transition-colors duration-200 group-hover:text-primary'>
                        {testimonial.name}
                      </h3>
                      <div className='mt-0.5 flex items-center gap-0.5'>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3.5 w-3.5 ${star <= testimonial.stars
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-muted/20 text-muted-foreground/30'
                              }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Middle Section: Quote Snippet */}
                  <div className='min-w-0 flex-1 px-2'>
                    <p className='line-clamp-2 text-xs italic text-muted-foreground/90'>
                      "{testimonial.description}"
                    </p>
                  </div>

                  {/* Active Status Badge */}
                  <div className='flex flex-shrink-0 items-center gap-3'>
                    <Badge
                      variant={testimonial.isActive ? 'default' : 'destructive'}
                      className={
                        testimonial.isActive
                          ? 'border-green-500/20 bg-green-500/10 text-[10px] font-normal text-green-500 hover:bg-green-500/20'
                          : 'text-[10px] font-normal'
                      }
                    >
                      {testimonial.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  {/* Right Section: Actions */}
                  <div className='mt-2 flex flex-shrink-0 items-center justify-end md:mt-0 md:w-auto'>
                    <TestimonialRowActions testimonial={testimonial} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='flex h-72 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/60 bg-muted/20'>
            <MessageSquareQuote className='h-10 w-10 text-muted-foreground/60' />
            <div className='text-sm font-medium text-muted-foreground'>
              No testimonials found.
            </div>
          </div>
        )}
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

export default TestimonialList
