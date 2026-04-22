import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/query/apiClient'
import { useToast } from '@/hooks/use-toast'

export const notificationsQueryKey = ['notifications'] as const

export type NotificationItem = {
  id: string
  userId: string
  type: 'BLOG_APPROVED' | 'BLOG_REJECTED' | 'ORGANIZATION_VERIFIED'
  title: string
  body?: string | null
  read: boolean
  entityType?: string | null
  entityId?: string | null
  createdAt: string
}

type NotificationsApiResponse = {
  data: NotificationItem[]
  meta: { count: number; unreadCount: number }
}

export function useNotificationsQuery(enabled: boolean) {
  return useQuery({
    queryKey: notificationsQueryKey,
    queryFn: async () => {
      const res = await apiClient.get<NotificationsApiResponse>(
        '/api/v1/notifications',
        { params: { limit: 50, offset: 0 } }
      )
      return res.data
    },
    enabled,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.patch(`/api/v1/notifications/${id}/read`)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationsQueryKey })
    },
    onError: () => {
      toast({
        title: 'Could not update notification',
        variant: 'destructive',
      })
    },
  })
}
