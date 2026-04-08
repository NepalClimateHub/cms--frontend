import { AppRole } from './jwt.util'

/**
 * Check if a role has admin-level access (Super Admin, Admin, or Content Admin).
 * Used for route guards and UI visibility.
 */
export const isAdminLevel = (role: AppRole | null): boolean => {
  return (
    role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'CONTENT_ADMIN'
  )
}

/**
 * Check if a role can manage content (Content Admin or Super Admin).
 * Used for content moderation features.
 */
export const isContentAdmin = (role: AppRole | null): boolean => {
  return role === 'SUPER_ADMIN' || role === 'CONTENT_ADMIN'
}

/**
 * Check if a role can verify users/orgs (Admin or Super Admin).
 * Used for verification features.
 */
export const isVerificationAdmin = (role: AppRole | null): boolean => {
  return role === 'SUPER_ADMIN' || role === 'ADMIN'
}

/**
 * Check if a role is Super Admin.
 * Used for user promotion features.
 */
export const isSuperAdmin = (role: AppRole | null): boolean => {
  return role === 'SUPER_ADMIN'
}
