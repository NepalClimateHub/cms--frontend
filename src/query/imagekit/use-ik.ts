import { useQuery } from '@tanstack/react-query'
import { imagekit } from '../shared/routes'
import { getIkAuthParams } from './ik-service'

export const useGetIkAuthParams = (enabled = true) => {
  return useQuery({
    queryKey: [imagekit.getauthparams.key],
    queryFn: () => getIkAuthParams(),
    enabled,
  })
}
