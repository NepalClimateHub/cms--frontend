import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { tagControllerGetTagsOptions } from '@/api/@tanstack/react-query.gen'
import { toast } from '@/hooks/use-toast'
import { tagControllerAddTagMutation } from '../../api/@tanstack/react-query.gen'

export const useGetTags = (options: any) => {
  return useQuery({
    ...tagControllerGetTagsOptions(options),
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
