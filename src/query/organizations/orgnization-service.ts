import { Meta } from '@/schemas/shared'
import { buildQueryParams } from '@/utils/query-params'
import apiClient from '../apiClient'
import { organizations } from '../shared/routes'
import { Organization } from '@/schemas/organization/organization'

export const getOrganizations = async (
  query: { [k: string]: string | number | string[] | number[] } = {}
): Promise<{
  data: Organization[]
  meta: Meta
}> => {
  const queryParams = buildQueryParams(query)
  const response = await apiClient.get(organizations.getall.path, {
    params: queryParams,
  })
  return response?.data
}
