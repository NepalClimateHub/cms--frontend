import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { TagsInitializer, TagsType } from '@/schemas/tags/tags'
import { handleServerError } from '@/utils/handle-server-error'
import { cleanObj } from '@/utils/obj-utils'
import { toast } from '@/hooks/use-toast'
import { tags } from '../shared/routes'
import { addTag, getTags, getTagsByType } from './tags-service'

export const useAddTag = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: TagsInitializer) => addTag(payload),
    mutationKey: [tags.add.key],
    onError: (err: Error) => {
      handleServerError(err)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [tags.getall.key],
        exact: false,
      })
      toast({
        variant: 'default',
        title: 'Tag added successfully.',
      })
    },
  })
}

export const useGetTags = (
  query: { [k: string]: string | number | string[] | number[] } = {},
  enabled = true
) => {
  const cleanQuery = cleanObj(query)
  return useQuery({
    queryKey: [tags.getall.key, query],
    queryFn: () => getTags(cleanQuery),
    enabled,
  })
}

export const useGetTagsByType = (type: TagsType, enabled = true) => {
  return useQuery({
    queryKey: [tags.getall.key, type],
    queryFn: () => getTagsByType(type),
    enabled,
  })
}
