import type { OrganizationProfile } from '@/schemas/auth/organization-profile'

export type User = {
  id: string
  email: string
  fullName: string
  permissions: string[]
  isActive: boolean
  /** Platform admin verified the organization account (role ORGANIZATION) */
  isVerifiedByAdmin?: boolean
  isSuperAdmin?: boolean
  role?:
    | 'SUPER_ADMIN'
    | 'ADMIN'
    | 'CONTENT_ADMIN'
    | 'ORGANIZATION'
    | 'INDIVIDUAL'
  organization: OrganizationProfile | null
  bio?: string | null
  linkedin?: string | null
  currentRole?: string | null
  profilePhotoUrl?: string | null
  profilePhotoId?: string | null
  createdAt: string
  updatedAt: string
}
