import { FC } from 'react'
import { format } from 'date-fns'
import { Link } from '@tanstack/react-router'
import { useDeleteTestimonial, TestimonialResponseDto } from '@/query/testimonials/use-testimonials'
import { Badge } from '@/ui/shadcn/badge'
import { Button } from '@/ui/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/ui/shadcn/dialog'
import { Separator } from '@/ui/shadcn/separator'
import { Eye, Pen, Trash, Star, Quote } from 'lucide-react'

interface DataTableRowActionsProps {
  testimonial: TestimonialResponseDto
}

const TestimonialRowActions: FC<DataTableRowActionsProps> = ({ testimonial }) => {
  const deleteTestimonialMutation = useDeleteTestimonial()

  const handleDelete = () => {
    deleteTestimonialMutation.mutate(testimonial.id)
  }

  const formatDate = (date: string | undefined) => {
    if (!date) return 'N/A'
    try {
      return format(new Date(date), 'PPP')
    } catch {
      return date
    }
  }

  return (
    <>
      <div className='flex items-center justify-center gap-2'>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              size={'sm'}
              variant={'default'}
              className='h-6 bg-green-500 px-2'
            >
              <Eye className='h-3.5 w-3.5' />
            </Button>
          </DialogTrigger>
          <DialogContent className='flex max-h-[90vh] max-w-2xl flex-col overflow-hidden'>
            <DialogHeader className='flex-shrink-0'>
              <DialogTitle className='flex items-center gap-2 text-2xl font-bold'>
                Testimonial Details
              </DialogTitle>
            </DialogHeader>
            <DialogDescription className='min-h-0 flex-1 space-y-6 overflow-y-auto pr-2 text-foreground'>
              {/* Header Info */}
              <div className='flex flex-col items-center gap-6 sm:flex-row'>
                <div className='relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-full border-2 border-primary/20 bg-muted shadow-md'>
                  {testimonial.photoUrl ? (
                    <img
                      src={testimonial.photoUrl}
                      alt={testimonial.name}
                      className='h-full w-full object-cover'
                    />
                  ) : (
                    <div className='flex h-full w-full items-center justify-center text-3xl font-bold text-muted-foreground'>
                      {testimonial.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className='flex-1 space-y-2 text-center sm:text-left'>
                  <div>
                    <h2 className='text-xl font-bold text-foreground'>
                      {testimonial.name}
                    </h2>
                    <div className='mt-1 flex items-center justify-center gap-1 sm:justify-start'>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${star <= testimonial.stars
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-muted/30 text-muted-foreground/30'
                            }`}
                        />
                      ))}
                      <span className='ml-1 text-xs font-semibold text-muted-foreground'>
                        ({testimonial.stars}/5)
                      </span>
                    </div>
                  </div>

                  <div className='flex flex-wrap items-center justify-center gap-2 pt-1 sm:justify-start'>
                    <Badge
                      variant={testimonial.isActive ? 'default' : 'destructive'}
                      className={
                        testimonial.isActive
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : ''
                      }
                    >
                      {testimonial.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Quote Content */}
              <div>
                <h3 className='mb-2 flex items-center gap-1.5 text-sm font-semibold text-muted-foreground'>
                  <Quote className='h-4 w-4 text-primary' /> Testimonial Content
                </h3>
                <p className='rounded-lg border border-border/40 bg-muted/30 p-4 text-sm italic leading-relaxed whitespace-pre-wrap'>
                  "{testimonial.description}"
                </p>
              </div>

              <Separator />
              <div className='flex justify-between text-xs text-muted-foreground'>
                <span>Created: {formatDate(testimonial.createdAt)}</span>
                <span>Sort Order: {testimonial.order}</span>
              </div>
            </DialogDescription>
          </DialogContent>
        </Dialog>

        <Link to='/testimonials/$id' params={{ id: testimonial.id }}>
          <Button
            size={'sm'}
            variant={'default'}
            className='h-6 bg-blue-500 px-2'
          >
            <Pen className='h-3.5 w-3.5' />
          </Button>
        </Link>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              size={'sm'}
              variant={'destructive'}
              className='h-6 px-2'
            >
              <Trash className='h-3.5 w-3.5' />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Testimonial</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this testimonial from {testimonial.name}? This action cannot
                be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type='submit'
                variant='destructive'
                onClick={handleDelete}
                disabled={deleteTestimonialMutation.isPending}
              >
                {deleteTestimonialMutation.isPending ? 'Deleting...' : 'Delete Testimonial'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}

export default TestimonialRowActions
