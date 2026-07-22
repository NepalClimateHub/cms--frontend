import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { useCreateTestimonial } from '@/query/testimonials/use-testimonials'
import { TestimonialFormValues, testimonialSchema } from '@/schemas/testimonial'
import { Main } from '@/ui/layouts/main'
import PageHeader from '@/ui/page-header'
import { Button } from '@/ui/shadcn/button'
import { ArrowLeft } from 'lucide-react'
import TestimonialForm from '../shared/TestimonialForm'

export default function AddTestimonial() {
  const createTestimonialMutation = useCreateTestimonial()
  const navigate = useNavigate()

  const form = useForm<TestimonialFormValues>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      name: '',
      photoUrl: '',
      photoId: '',
      description: '',
      stars: 5,
      isActive: true,
      order: 0,
    },
  })

  const handleImageUpload = (
    assetId: string | null,
    assetURL: string | null
  ) => {
    form.setValue('photoId', assetId || undefined)
    form.setValue('photoUrl', assetURL || undefined)
  }

  const onSubmit = async (values: TestimonialFormValues) => {
    createTestimonialMutation.mutate(values, {
      onSuccess: () => {
        navigate({ to: '/testimonials' })
      },
    })
  }

  return (
    <Main>
      <PageHeader
        title='Add Testimonial'
        description='Create a new testimonial record'
        actions={
          <Button
            variant='outline'
            onClick={() => navigate({ to: '/testimonials' })}
          >
            <ArrowLeft className='mr-2 h-4 w-4' /> Back
          </Button>
        }
      />
      <div className='mt-4'>
        <TestimonialForm
          form={form}
          handleImageUpload={handleImageUpload}
          handleFormSubmit={onSubmit}
          isEdit={false}
          isLoading={createTestimonialMutation.isPending}
        />
      </div>
    </Main>
  )
}
