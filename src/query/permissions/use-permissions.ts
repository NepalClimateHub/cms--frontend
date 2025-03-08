import { useQuery } from '@tanstack/react-query'
import { getPermissions } from './permissions-service'
import { permissions } from '../shared/routes'

export const useGetPermissions = (enabled = true) => {
  return useQuery({
    queryKey: [permissions.getall.path],
    queryFn: getPermissions,
    enabled
  })
}
