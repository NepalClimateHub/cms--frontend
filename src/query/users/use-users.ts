import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  userControllerGetUsersOptions,
  userControllerUpdateUserMutation,
} from '@/api/@tanstack/react-query.gen'
import apiClient from '../apiClient'

function invalidateUsersListQueries(queryClient: QueryClient) {
  return queryClient.invalidateQueries({
    predicate: (query) => {
      const key = query.queryKey[0]
      return (
        key !== null &&
        typeof key === 'object' &&
        '_id' in key &&
        (key as { _id: string })._id === 'userControllerGetUsers'
      )
    },
  })
}

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

export type AdminUpdateUserBody = {
  name?: string
  password?: string
  role?: string
  isSuperAdmin?: boolean
  phoneNumber?: string | null
}

export const useUpdateUserByAdmin = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: { id: string; body: AdminUpdateUserBody }) => {
      const res = await apiClient.patch(
        `/api/v1/users/${payload.id}`,
        payload.body
      )
      return res.data
    },
    onSuccess: () => {
      void invalidateUsersListQueries(queryClient)
    },
  })
}
