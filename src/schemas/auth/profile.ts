import type { OrganizationProfile } from '@/schemas/auth/organization-profile'

export type User = {
  id: string
  email: string
  fullName: string
  permissions: string[]
  isActive: boolean
  userType?: 'SUPER_ADMIN' | 'ADMIN' | 'CONTENT_ADMIN' | 'ORGANIZATION' | 'INDIVIDUAL'
  organization: OrganizationProfile | null
  bio?: string | null
  linkedin?: string | null
  currentRole?: string | null
  profilePhotoUrl?: string | null
  profilePhotoId?: string | null
  createdAt: string
  updatedAt: string
}
