import { useQuery } from '@tanstack/react-query'
import { imagekitControllerGetAuthParamasOptions } from '../../api/@tanstack/react-query.gen'

export const useGetIkAuthParams = (enabled = true) => {
  return useQuery({
    // queryKey: [imagekit.getauthparams.key],
    // queryFn: () => getIkAuthParams(),
    ...imagekitControllerGetAuthParamasOptions(),
    enabled,
  })
}
