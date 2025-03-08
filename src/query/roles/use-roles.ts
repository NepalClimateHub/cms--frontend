import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { RoleFormValues } from '@/schemas/roles/roles'
import { handleServerError } from '@/utils/handle-server-error'
import { cleanObj } from '@/utils/obj-utils'
import { toast } from '@/hooks/use-toast'
import { roles } from '../shared/routes'
import { addRole, getRoles } from './roles-service'

export const useAddRole = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: RoleFormValues) => addRole(payload),
    mutationKey: [roles.add.key],
    onError: (err: Error) => {
      handleServerError(err)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [roles.getall.key],
        exact: false,
      })
      toast({
        variant: 'default',
        title: 'Role added successfully.',
      })
    },
  })
}

export const useGetRoles = (
  query: { [k: string]: string | number | string[] | number[] } = {},
  enabled = true
) => {
  const cleanQuery = cleanObj(query)
  return useQuery({
    queryKey: [roles.getall.key, query],
    queryFn: () => getRoles(cleanQuery),
    enabled,
  })
}
