import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MemberFormValues } from '@/schemas/member'
import { Meta } from '@/schemas/shared'
import { toast } from 'sonner'
import { client } from '@/api/client.gen'

export interface MemberResponseDto {
  id: string
  name: string
  email: string
  currentAddress?: string
  permanentAddress?: string
  phoneNumber?: string
  linkedinProfile?: string
  photoUrl?: string
  photoId?: string
  bio?: string
  role: string
  startDate?: string
  endDate?: string
  isActive: boolean
  team: string
  status: string
  order: number
  createdAt: string
  updatedAt: string
}

export const useGetMembers = (params: Record<string, unknown>) => {
  return useQuery({
    queryKey: ['members', params],
    queryFn: async () => {
      const response = await client.get({
        url: '/api/v1/members',
        query: params,
      })
      return response.data as {
        data: MemberResponseDto[]
        meta: Meta
      }
    },
  })
}

export const useGetMember = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['member', id],
    queryFn: async () => {
      const response = await client.get({ url: `/api/v1/members/${id}` })
      return response.data as { data: MemberResponseDto }
    },
    enabled,
  })
}

export const useCreateMember = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: MemberFormValues) => {
      const response = await client.post({ url: '/api/v1/members', body: data })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
      toast.success('Member created successfully')
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create member'
      )
    },
  })
}

export const useUpdateMember = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: MemberFormValues
    }) => {
      const response = await client.patch({
        url: `/api/v1/members/${id}`,
        body: data,
      })
      return response.data
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
      queryClient.invalidateQueries({ queryKey: ['member', id] })
      toast.success('Member updated successfully')
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update member'
      )
    },
  })
}

export const useDeleteMember = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await client.delete({ url: `/api/v1/members/${id}` })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
      toast.success('Member deleted successfully')
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete member'
      )
    },
  })
}

export const useReorderMembers = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (orders: { id: string; order: number }[]) => {
      const response = await client.patch({
        url: '/api/v1/members/reorder',
        body: { orders },
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
      toast.success('Members reordered successfully')
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to reorder members'
      )
    },
  })
}
