import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { CreateNewsDto } from '@/api'
import { toast } from '@/hooks/use-toast'
import { newsControllerDeleteNewsMutation } from '../../api/@tanstack/react-query.gen'
import {
  newsControllerAddNewsMutation,
  newsControllerGetNewsOptions,
} from '../../api/@tanstack/react-query.gen'

export const useGetNews = () => {
  return useQuery({
    ...newsControllerGetNewsOptions(),
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
  return useMutation({
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
  })
}
