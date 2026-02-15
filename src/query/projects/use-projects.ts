
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { client } from '@/api/client.gen'
import { ProjectFormValues } from '@/schemas/project'

export interface ProjectResponseDto {
  id: string
  title: string
  duration?: string
  overview: string
  description: string
  status: 'ONGOING' | 'COMPLETED' | 'UPCOMING'
  bannerImageUrl?: string
  bannerImageId?: string
  isDraft: boolean
  tags?: Tag[]
  createdAt: string
  updatedAt: string
}

export interface Tag {
  id: string
  tag: string
  isProjectTag: boolean
}

export const useGetProjects = (params: any) => {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: async () => {
      const response = await client.get({ url: '/api/v1/projects', query: params })
      
      return response.data as { data: ProjectResponseDto[]; meta: any }
    },
  })
}

export const useGetProject = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const response = await client.get({ url: `/api/v1/projects/${id}` })
      return response.data as { data: ProjectResponseDto }
    },
    enabled,
  })
}

export const useCreateProject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ProjectFormValues) => {
      const response = await client.post({ url: '/api/v1/projects', body: data })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project created successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create project')
    },
  })
}

export const useUpdateProject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProjectFormValues }) => {
      const response = await client.patch({ url: `/api/v1/projects/${id}`, body: data })
      return response.data
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project', id] })
      toast.success('Project updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update project')
    },
  })
}

export const useDeleteProject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await client.delete({ url: `/api/v1/projects/${id}` })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete project')
    },
  })
}
