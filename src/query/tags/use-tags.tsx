import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { TagsType } from '@/schemas/tags/tags'
import { tagControllerGetTagsOptions } from '@/api/@tanstack/react-query.gen'
import { toast } from '@/hooks/use-toast'
import { tagControllerDeleteTagMutation } from '../../api/@tanstack/react-query.gen'
import {
  tagControllerAddTagMutation,
  tagControllerGetTagsTypeOptions,
} from '../../api/@tanstack/react-query.gen'

export const useGetTags = (options: any) => {
  return useQuery({
    ...tagControllerGetTagsOptions(options),
  })
}

export const useTagsAPI = () => {
  const queryClient = useQueryClient()
  return {
    delete: useMutation({
      ...tagControllerDeleteTagMutation(),
      onSuccess: () => {
        queryClient.invalidateQueries(tagControllerGetTagsOptions())
        toast({
          title: 'Tag added',
          description: 'Tag has been added successfully.',
          variant: 'default',
        })
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to delete tag.',
          variant: 'destructive',
        })
      },
    }),
  }
}

export const useGetTagsByType = (type: TagsType) => {
  return useQuery({
    ...tagControllerGetTagsTypeOptions({
      path: {
        type: type,
      },
    }),
  })
}

export const useAddTags = () => {
  const queryClient = useQueryClient()
  return useMutation({
    ...tagControllerAddTagMutation(),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(tagControllerGetTagsOptions())
      toast({
        title: 'Tag added',
        description: 'Tag has been added successfully.',
        variant: 'default',
      })
    },
  })
}
