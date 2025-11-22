import { useQuery } from '@tanstack/react-query'
import { userControllerGetUsersOptions } from '@/api/@tanstack/react-query.gen'

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
