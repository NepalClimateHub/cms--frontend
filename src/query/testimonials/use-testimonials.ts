import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { TestimonialFormValues } from '@/schemas/testimonial'
import { Meta } from '@/schemas/shared'
import { toast } from 'sonner'
import { client } from '@/api/client.gen'

export interface TestimonialResponseDto {
  id: string
  name: string
  photoUrl?: string
  photoId?: string
  description: string
  stars: number
  isActive: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export const useGetTestimonials = (params: Record<string, unknown>) => {
  return useQuery({
    queryKey: ['testimonials', params],
    queryFn: async () => {
      const response = await client.get({
        url: '/api/v1/testimonials',
        query: params,
      })
      return response.data as {
        data: TestimonialResponseDto[]
        meta: Meta
      }
    },
  })
}

export const useGetTestimonial = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['testimonial', id],
    queryFn: async () => {
      const response = await client.get({ url: `/api/v1/testimonials/${id}` })
      return response.data as { data: TestimonialResponseDto }
    },
    enabled,
  })
}

export const useCreateTestimonial = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: TestimonialFormValues) => {
      const response = await client.post({ url: '/api/v1/testimonials', body: data })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] })
      toast.success('Testimonial created successfully')
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create testimonial'
      )
    },
  })
}

export const useUpdateTestimonial = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: TestimonialFormValues
    }) => {
      const response = await client.patch({
        url: `/api/v1/testimonials/${id}`,
        body: data,
      })
      return response.data
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] })
      queryClient.invalidateQueries({ queryKey: ['testimonial', id] })
      toast.success('Testimonial updated successfully')
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update testimonial'
      )
    },
  })
}

export const useDeleteTestimonial = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await client.delete({ url: `/api/v1/testimonials/${id}` })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] })
      toast.success('Testimonial deleted successfully')
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete testimonial'
      )
    },
  })
}

export const useReorderTestimonials = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (orders: { id: string; order: number }[]) => {
      const response = await client.patch({
        url: '/api/v1/testimonials/reorder',
        body: { orders },
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] })
      toast.success('Testimonials reordered successfully')
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to reorder testimonials'
      )
    },
  })
}
