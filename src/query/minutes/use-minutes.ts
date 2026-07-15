import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { cleanObj } from '@/utils/obj-utils'
import { toast } from '@/hooks/use-toast'
import {
  minutesControllerCreateMutation,
  minutesControllerFindAllOptions,
  minutesControllerFindOneOptions,
  minutesControllerRemoveMutation,
  minutesControllerUpdateMutation,
} from '../../api/@tanstack/react-query.gen'

export function useMinutesAPI() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return {
    addMinutes: useMutation({
      ...minutesControllerCreateMutation(),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['minutesControllerFindAll'],
        })
        toast({
          title: 'Minutes added',
          description: 'Meeting minutes have been added successfully.',
          variant: 'default',
        })
        navigate({ to: '/minutes' })
      },
      onError: (err: any) => {
        toast({
          title: 'Error adding minutes',
          description: err?.message || 'There was an error adding minutes.',
          variant: 'destructive',
        })
      },
    }),

    deleteMinutes: useMutation({
      ...minutesControllerRemoveMutation(),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['minutesControllerFindAll'],
        })
        toast({
          title: 'Minutes deleted',
          description: 'Minutes have been deleted successfully.',
          variant: 'default',
        })
      },
      onError: (err: any) => {
        toast({
          title: 'Error deleting minutes',
          description: err?.message || 'There was an error deleting minutes.',
          variant: 'destructive',
        })
      },
    }),

    updateMinutes: useMutation({
      ...minutesControllerUpdateMutation(),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['minutesControllerFindAll'],
        })
        toast({
          title: 'Minutes updated',
          description: 'Minutes have been updated successfully.',
          variant: 'default',
        })
        navigate({ to: '/minutes' })
      },
      onError: (err: any) => {
        toast({
          title: 'Error updating minutes',
          description: err?.message || 'There was an error updating minutes.',
          variant: 'destructive',
        })
      },
    }),
  }
}

export const useGetMinutes = (params: { limit?: number; offset?: number; title?: string }) => {
  const cleanedParams = cleanObj({
    limit: params.limit,
    offset: params.offset,
    title: params.title || undefined,
  })

  return useQuery({
    ...minutesControllerFindAllOptions({
      query: cleanedParams,
    }),
    select: (data: any) => data,
  })
}

export const useGetOneMinutes = (id: string) => {
  return useQuery({
    ...minutesControllerFindOneOptions({
      path: { id },
    }),
    enabled: !!id,
    select: (data: any) => data?.data,
  })
}
