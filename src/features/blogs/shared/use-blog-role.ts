import { useAuthStore } from '@/stores/authStore'
import { type AppRole, getRoleFromToken } from '@/utils/jwt.util'

export const useBlogRole = () => {
  const { user } = useAuthStore()
  const role = (user?.role ?? getRoleFromToken()) as AppRole | null | undefined
  return {
    isStaff:
      role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'CONTENT_ADMIN',
    canAutoPublish: role === 'SUPER_ADMIN' || role === 'CONTENT_ADMIN',
  }
}
