import { RoleFormValues, Roles } from '@/schemas/roles/roles'
import { Meta } from '@/schemas/shared'
import { buildQueryParams } from '@/utils/query-params'
import apiClient from '../apiClient'
import { roles } from '../shared/routes'

export const addRole = async (
  payload: RoleFormValues
): Promise<{
  data: {}
  meta: Meta
}> => {
  const response = await apiClient.post(roles.add.path, payload)
  return response?.data
}

export const getRoles = async (
  query: { [k: string]: string | number | string[] | number[] } = {}
): Promise<{
  data: Roles[]
  meta: Meta
}> => {
  const queryParams = buildQueryParams(query)
  const response = await apiClient.get(roles.getall.path, {
    params: queryParams,
  })
  return response?.data
}
