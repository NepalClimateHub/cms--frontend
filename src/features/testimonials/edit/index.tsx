import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useGetTestimonial, useUpdateTestimonial } from '@/query/testimonials/use-testimonials'
import { TestimonialFormValues, testimonialSchema } from '@/schemas/testimonial'
import { Main } from '@/ui/layouts/main'
import { BoxLoader } from '@/ui/loader'
import PageHeader from '@/ui/page-header'
import { Button } from '@/ui/shadcn/button'
import { ArrowLeft } from 'lucide-react'
import TestimonialForm from '../shared/TestimonialForm'

export default function EditTestimonial() {
  const { id } = useParams({ from: '/_authenticated/testimonials/$id' })
  const { data: testimonial, isLoading: isTestimonialLoading } = useGetTestimonial(id)
  const updateTestimonialMutation = useUpdateTestimonial()
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

  useEffect(() => {
    if (testimonial && testimonial.data) {
      form.reset({
        name: testimonial.data.name,
        photoUrl: testimonial.data.photoUrl || '',
        photoId: testimonial.data.photoId || '',
        description: testimonial.data.description || '',
        stars: testimonial.data.stars || 5,
        isActive: testimonial.data.isActive,
        order: testimonial.data.order,
      })
    }
  }, [testimonial, form])

  const handleImageUpload = (
    assetId: string | null,
    assetURL: string | null
  ) => {
    form.setValue('photoId', assetId || undefined)
    form.setValue('photoUrl', assetURL || undefined)
  }

  const onSubmit = async (values: TestimonialFormValues) => {
    updateTestimonialMutation.mutate(
      { id, data: values },
      {
        onSuccess: () => {
          navigate({ to: '/testimonials' })
        },
      }
    )
  }

  if (isTestimonialLoading) {
    return <BoxLoader />
  }

  return (
    <Main>
      <PageHeader
        title='Edit Testimonial'
        description='Update testimonial details'
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
          isEdit={true}
          isLoading={updateTestimonialMutation.isPending}
        />
      </div>
    </Main>
  )
}
