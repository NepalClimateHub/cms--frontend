import { useQuery } from '@tanstack/react-query'
import { analyticsControllerGetAdminAnalyticsOptions } from '../../api/@tanstack/react-query.gen'
import apiClient from '../apiClient'

export const useAnalyticsAPI = () => {
  return {
    getAnalyticsForAdmin: useQuery({
      ...analyticsControllerGetAdminAnalyticsOptions(),
    }),
  }
}

export interface MonthlyUserStats {
  month: string
  count: number
}

export interface MonthlyUserStatsResponse {
  monthlyStats: MonthlyUserStats[]
  year: number
}

export const useMonthlyUserStats = (year: number) => {
  return useQuery({
    queryKey: ['monthlyUserStats', year],
    queryFn: async () => {
      const response = await apiClient.get(
        '/api/v1/analytics/monthly-user-stats',
        {
          params: { year: year.toString() },
        }
      )
      return response.data.data as MonthlyUserStatsResponse
    },
  })
}

export interface TopBlogAuthor {
  userId: string
  name: string
  email: string
  blogCount: number
}

export const useTopBlogAuthors = () => {
  return useQuery({
    queryKey: ['topBlogAuthors'],
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/analytics/top-blog-authors')
      return response.data.data as TopBlogAuthor[]
    },
  })
}

export interface NewJoinedUser {
  userId: string
  name: string
  email: string
  joinedAt: string
  role: string
}

export const useNewJoinedUsers = () => {
  return useQuery({
    queryKey: ['newJoinedUsers'],
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/analytics/new-joined-users')
      return response.data.data as NewJoinedUser[]
    },
  })
}
