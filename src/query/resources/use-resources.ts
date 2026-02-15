
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { client } from '@/api/client.gen'

export enum ResourceType {
  DOCUMENTARY = 'DOCUMENTARY',
  PODCASTS_AND_TELEVISION = 'PODCASTS_AND_TELEVISION',
  COURSES = 'COURSES',
  PLANS_AND_POLICIES = 'PLANS_AND_POLICIES',
  DATA_RESOURCES = 'DATA_RESOURCES',
  PLATFORMS = 'PLATFORMS',
  RESEARCH_ARTICLES = 'RESEARCH_ARTICLES',
  THESES_AND_DISSERTATIONS = 'THESES_AND_DISSERTATIONS',
  CASE_STUDIES = 'CASE_STUDIES',
  REPORTS = 'REPORTS',
  TOOLKITS_AND_GUIDES = 'TOOLKITS_AND_GUIDES',
}

export enum ResourceLevel {
  INTERNATIONAL = 'INTERNATIONAL',
  REGIONAL = 'REGIONAL',
  NATIONAL = 'NATIONAL',
  PROVINCIAL = 'PROVINCIAL',
  LOCAL = 'LOCAL',
}

export interface Tag {
  id: string
  tag: string
  isResourceTag: boolean
}

export interface ResourceResponseDto {
  id: string
  title: string
  overview?: string
  type: ResourceType
  level?: ResourceLevel
  link?: string
  courseProvider?: string
  platform?: string
  duration?: string
  author?: string
  publicationYear?: string
  bannerImageUrl?: string
  bannerImageId?: string
  isDraft: boolean
  tags?: Tag[]
  createdAt: string
  updatedAt: string
}

export interface CreateResourceFormValues {
  title: string
  overview?: string
  type: ResourceType
  level?: ResourceLevel
  link?: string
  courseProvider?: string
  platform?: string
  duration?: string
  author?: string
  publicationYear?: string
  bannerImageUrl?: string
  bannerImageId?: string
  isDraft?: boolean
  tagIds?: string[]
}

export const useGetResources = (params: any) => {
  return useQuery({
    queryKey: ['resources', params],
    queryFn: async () => {
      const response = await client.get({ url: '/api/v1/resources', query: params })
      return response.data as { data: ResourceResponseDto[]; meta: any }
    },
  })
}

export const useGetResource = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['resource', id],
    queryFn: async () => {
      const response = await client.get({ url: `/api/v1/resources/${id}` })
      return response.data as { data: ResourceResponseDto }
    },
    enabled,
  })
}

export const useCreateResource = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateResourceFormValues) => {
      const response = await client.post({ url: '/api/v1/resources', body: data })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] })
      toast.success('Resource created successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create resource')
    },
  })
}

export const useUpdateResource = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateResourceFormValues> }) => {
      const response = await client.patch({ url: `/api/v1/resources/${id}`, body: data })
      return response.data
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['resources'] })
      queryClient.invalidateQueries({ queryKey: ['resource', id] })
      toast.success('Resource updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update resource')
    },
  })
}

export const useDeleteResource = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await client.delete({ url: `/api/v1/resources/${id}` })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] })
      toast.success('Resource deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete resource')
    },
  })
}
