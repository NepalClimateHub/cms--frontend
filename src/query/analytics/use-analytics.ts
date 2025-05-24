import { useQuery } from '@tanstack/react-query'
import { analyticsControllerGetAdminAnalyticsOptions } from '../../api/@tanstack/react-query.gen'

export const useAnalyticsAPI = () => {
  return {
    getAnalyticsForAdmin: useQuery({
      ...analyticsControllerGetAdminAnalyticsOptions(),
    }),
  }
}
