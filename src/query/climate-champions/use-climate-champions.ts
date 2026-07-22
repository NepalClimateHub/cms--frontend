import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ClimateChampionFormValues } from '@/schemas/climate-champion'
import { Meta } from '@/schemas/shared'
import { toast } from 'sonner'
import { client } from '@/api/client.gen'

export interface ClimateChampionResponseDto {
  id: string
  name: string
  email?: string
  location?: string
  bio?: string
  photoUrl?: string
  photoId?: string
  tags: string[]
  website?: string
  facebook?: string
  instagram?: string
  linkedin?: string
  isActive: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export const useGetClimateChampions = (params: Record<string, unknown>) => {
  return useQuery({
    queryKey: ['climate-champions', params],
    queryFn: async () => {
      const response = await client.get({
        url: '/api/v1/climate-champions',
        query: params,
      })
      return response.data as {
        data: ClimateChampionResponseDto[]
        meta: Meta
      }
    },
  })
}

export const useGetClimateChampion = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['climate-champion', id],
    queryFn: async () => {
      const response = await client.get({ url: `/api/v1/climate-champions/${id}` })
      return response.data as { data: ClimateChampionResponseDto }
    },
    enabled,
  })
}

export const useCreateClimateChampion = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ClimateChampionFormValues) => {
      const response = await client.post({ url: '/api/v1/climate-champions', body: data })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['climate-champions'] })
      toast.success('Climate Champion created successfully')
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create climate champion'
      )
    },
  })
}

export const useUpdateClimateChampion = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: ClimateChampionFormValues
    }) => {
      const response = await client.patch({
        url: `/api/v1/climate-champions/${id}`,
        body: data,
      })
      return response.data
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['climate-champions'] })
      queryClient.invalidateQueries({ queryKey: ['climate-champion', id] })
      toast.success('Climate Champion updated successfully')
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update climate champion'
      )
    },
  })
}

export const useDeleteClimateChampion = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await client.delete({ url: `/api/v1/climate-champions/${id}` })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['climate-champions'] })
      toast.success('Climate Champion deleted successfully')
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete climate champion'
      )
    },
  })
}

export const useReorderClimateChampions = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (orders: { id: string; order: number }[]) => {
      const response = await client.patch({
        url: '/api/v1/climate-champions/reorder',
        body: { orders },
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['climate-champions'] })
      toast.success('Climate Champions reordered successfully')
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to reorder climate champions'
      )
    },
  })
}
