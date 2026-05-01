import type { OrganizationProfile } from '@/schemas/auth/organization-profile'

export type UserSocials = {
  facebook?: string
  instagram?: string
  linkedin?: string
}

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
  currentRole?: string | null
  profilePhotoUrl?: string | null
  profilePhotoId?: string | null
  bannerImageUrl?: string | null
  bannerImageId?: string | null
  socials?: UserSocials | null
  createdAt: string
  updatedAt: string
}
