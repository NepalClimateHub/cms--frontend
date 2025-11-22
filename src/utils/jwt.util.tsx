import { getAccessToken } from "../stores/authStore"

// Helper to get role from JWT token
export const getRoleFromToken = (): 'ADMIN' | 'USER' | null => {
    const accessToken = getAccessToken()
    if (!accessToken) return null
  
    try {
      const decoded = JSON.parse(atob(accessToken.split('.')[1])) as unknown as {
        role: string
      }
      if (decoded?.role === 'ADMIN' || decoded?.role === 'USER') {
        return decoded.role as 'ADMIN' | 'USER'
      }
    } catch (error) {
      console.error('Failed to decode token:', error)
    }
    return null
  }