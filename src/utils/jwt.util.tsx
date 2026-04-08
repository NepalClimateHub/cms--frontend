import { getAccessToken } from "../stores/authStore"

export type AppRole = 'SUPER_ADMIN' | 'ADMIN' | 'CONTENT_ADMIN' | 'USER'

const VALID_ROLES: AppRole[] = ['SUPER_ADMIN', 'ADMIN', 'CONTENT_ADMIN', 'USER']

// Helper to get role from JWT token
export const getRoleFromToken = (): AppRole | null => {
    const accessToken = getAccessToken()
    if (!accessToken) return null
  
    try {
      const decoded = JSON.parse(atob(accessToken.split('.')[1])) as unknown as {
        role: string
      }
      if (decoded?.role && VALID_ROLES.includes(decoded.role as AppRole)) {
        return decoded.role as AppRole
      }
    } catch (error) {
      console.error('Failed to decode token:', error)
    }
    return null
  }