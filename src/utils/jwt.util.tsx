import { getAccessToken } from '../stores/authStore'

export type AppRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'CONTENT_ADMIN'
  | 'ORGANIZATION'
  | 'INDIVIDUAL'

const VALID_ROLES: AppRole[] = [
  'SUPER_ADMIN',
  'ADMIN',
  'CONTENT_ADMIN',
  'ORGANIZATION',
  'INDIVIDUAL',
]

// Helper to get role from JWT token
export const getRoleFromToken = (): AppRole | null => {
  const accessToken = getAccessToken()
  if (!accessToken) return null

  try {
    const decoded = JSON.parse(atob(accessToken.split('.')[1])) as unknown as {
      role?: string
      userType?: string
    }
    const role = decoded?.role ?? decoded?.userType
    if (role && VALID_ROLES.includes(role as AppRole)) {
      return role as AppRole
    }
  } catch (_error) {
    // Token decode failed – return null below
  }
  return null
}
