import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { cleanObj } from '@/utils/obj-utils'
import { toast } from '@/hooks/use-toast'
import {
  newsControllerDeleteNewsMutation,
  newsControllerGetOneNewsOptions,
} from '../../api/@tanstack/react-query.gen'
import {
  newsControllerAddNewsMutation,
  newsControllerGetNewsOptions,
  newsControllerUpdateNewsMutation,
} from '../../api/@tanstack/react-query.gen'

export const useNewsAPI = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return {
    addNews: useMutation({
      ...newsControllerAddNewsMutation(),
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries(newsControllerGetNewsOptions())
        toast({
          title: 'News added',
          description: 'News has been added successfully.',
          variant: 'default',
        })
        navigate({ to: '/news/list' })
      },
    }),

    updateNews: useMutation({
      ...newsControllerUpdateNewsMutation(),
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries(newsControllerGetNewsOptions())
        toast({
          title: 'News updated',
          description: 'News has been updated successfully.',
          variant: 'default',
        })
        navigate({ to: '/news/list' })
      },
    }),
  }
}

export const useGetNews = (
  query: { [k: string]: string | number | string[] | number[] } = {}
) => {
  const cleanQuery = cleanObj(query)
  return useQuery({
    ...newsControllerGetNewsOptions({ query: cleanQuery }),
  })
}

export const useGetNewsById = (newsId: string) => {
  return useQuery({
    ...newsControllerGetOneNewsOptions({
      path: {
        id: newsId,
      },
    }),
  })
}

export const useDeleteNews = () => {
  const queryClient = useQueryClient()
  return useMutation({
    ...newsControllerDeleteNewsMutation(),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(newsControllerGetNewsOptions())
      toast({
        title: 'News deleted',
        description: 'News has been deleted successfully.',
        variant: 'default',
      })
    },

    onError: () => {
      toast({
        title: 'Error deleting news',
        description: 'There was an error deleting the news.',
        variant: 'destructive',
      })
    },
  })
}

export const useAddNews = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
}
