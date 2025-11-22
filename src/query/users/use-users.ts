import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  userControllerGetUsersOptions,
  userControllerUpdateUserMutation,
} from '@/api/@tanstack/react-query.gen'

export const useGetUsers = (
  query: { limit?: number; offset?: number } = {},
  enabled = true
) => {
  return useQuery({
    ...userControllerGetUsersOptions({
      query: {
        limit: query.limit ?? 100,
        offset: query.offset ?? 0,
      },
    }),
    enabled,
  })
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    ...userControllerUpdateUserMutation(),
    onSuccess: () => {
      // Invalidate user profile query to refetch updated data
      queryClient.invalidateQueries({
        queryKey: ['userControllerGetMyProfile'],
      })
    },
  })
}
