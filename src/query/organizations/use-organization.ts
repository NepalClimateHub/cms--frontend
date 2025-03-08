import { useQuery } from '@tanstack/react-query'
import { cleanObj } from '@/utils/obj-utils'
import { organizations } from '../shared/routes'
import { getOrganizations } from './orgnization-service'

export const useGetOrganizations = (
  query: { [k: string]: string | number | string[] | number[] } = {},
  enabled = true
) => {
  const cleanQuery = cleanObj(query)
  return useQuery({
    queryKey: [organizations.getall.key, query],
    queryFn: () => getOrganizations(cleanQuery),
    enabled,
  })
}
