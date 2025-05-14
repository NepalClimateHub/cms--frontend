import { useQuery } from '@tanstack/react-query'
import { cleanObj } from '@/utils/obj-utils'
import { organizationControllerGetOneOrganizationOptions } from '../../api/@tanstack/react-query.gen'

export const useGetOrganizations = (
  query: { [k: string]: string | number | string[] | number[] } = {},
  enabled = true
) => {
  const cleanQuery = cleanObj(query)

  return useQuery({
    ...organizationControllerGetOneOrganizationOptions({
      // @ts-expect-error - TODO: check type
      query: {
        ...cleanQuery,
      },
    }),
    enabled,
  })
}
