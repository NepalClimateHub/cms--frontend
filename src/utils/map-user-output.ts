import type { OrganizationProfileOutputDto, UserOutput } from '@/api/types.gen'
import type { OrganizationProfile } from '@/schemas/auth/organization-profile'
import type { User } from '@/schemas/auth/profile'

/** Coerce OpenAPI `unknown`-shaped fields to string | null. */
export function nullableString(value: unknown): string | null {
  if (value == null) return null
  if (typeof value === 'string') return value
  return null
}

export function mapOrganizationProfileDto(
  org: OrganizationProfileOutputDto | null | undefined
): OrganizationProfile | null {
  if (!org) return null
  return {
    id: org.id,
    name: org.name,
    logoImageUrl:
      typeof org.logoImageUrl === 'string' ? org.logoImageUrl : '',
    logoImageId: nullableString(org.logoImageId),
    verificationDocumentUrl: nullableString(org.verificationDocumentUrl),
    verificationDocumentId: nullableString(org.verificationDocumentId),
    verificationRequestRemarks: nullableString(org.verificationRequestRemarks),
    verificationRequestedAt: nullableString(org.verificationRequestedAt),
  }
}

export function mapUserOutputToAuthUser(
  data: UserOutput,
  organizationFallback?: OrganizationProfile | null
): User {
  const org = mapOrganizationProfileDto(data.organization)
  return {
    id: data.id,
    email: data.email,
    fullName: data.fullName,
    permissions: [],
    isActive: data.isEmailVerified,
    isVerifiedByAdmin: data.isVerifiedByAdmin,
    isSuperAdmin: data.isSuperAdmin,
    role: data.role,
    organization: org ?? organizationFallback ?? null,
    bio: nullableString(data.bio),
    linkedin: nullableString(data.linkedin),
    currentRole: nullableString(data.currentRole),
    profilePhotoUrl: nullableString(data.profilePhotoUrl),
    profilePhotoId: nullableString(data.profilePhotoId),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  }
}
