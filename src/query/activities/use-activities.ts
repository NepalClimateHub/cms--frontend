import { useQuery } from '@tanstack/react-query'
import { client } from '@/api/client.gen'
import { Meta } from '@/schemas/shared'

export interface ActivityLogResponseDto {
  id: string
  userId: string
  userEmail: string
  userName: string
  userRole: string
  action: 'LOGIN' | 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT'
  entity: 'AUTH' | 'BLOG' | 'EVENT' | 'NEWS' | 'OPPORTUNITY' | 'PROJECT' | 'RESOURCE' | 'MEMBER' | 'CLIMATE_CHAMPION'
  entityId?: string
  entityName?: string
  createdAt: string
}

export const useGetActivities = (params: Record<string, unknown>) => {
  return useQuery({
    queryKey: ['activity-logs', params],
    queryFn: async () => {
      const response = await client.get({ url: '/api/v1/activity-logs', query: params })
      return response.data as {
        data: ActivityLogResponseDto[]
        meta: Meta
      }
    },
  })
}
