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
 * CMS content modules (events, news, etc.): staff admins or ORGANIZATION accounts.
 * INDIVIDUAL accounts use a reduced sidebar and are redirected from these routes.
 */
export const canAccessOrganizationContentRoutes = (
  role: AppRole | null
): boolean => {
  return isAdminLevel(role) || role === 'ORGANIZATION'
}

/**
 * Blog list/add/edit: individuals and org accounts author posts, not only staff.
 */
export const canAccessBlogAuthoring = (role: AppRole | null): boolean => {
  return (
    role === 'SUPER_ADMIN' ||
    role === 'ADMIN' ||
    role === 'CONTENT_ADMIN' ||
    role === 'ORGANIZATION' ||
    role === 'INDIVIDUAL'
  )
}

/**
 * Super Admin and platform Admin: user list, org verification, DB export, etc.
 * Content Admins are excluded.
 */
export const canAccessUserDirectoryAndDatabaseExport = (
  role: AppRole | null
): boolean => {
  return role === 'SUPER_ADMIN' || role === 'ADMIN'
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
