import { UserOutput } from '@/api/types.gen'
import { nullableString } from '@/utils/map-user-output'
import { User } from '../data/schema'

// Map API UserOutput to table User schema
export const mapUserOutputToUser = (user: UserOutput): User => {
  const nameParts = (user.fullName || '').split(' ')
  const firstName = nameParts[0] || ''
  const lastName = nameParts.slice(1).join(' ') || ''
  const username =
    user.email.split('@')[0] || (user.fullName || '').toLowerCase().replace(/\s+/g, '')

  // Map phoneNumber object to string
  let phoneNumber = ''
  if (user.phoneNumber) {
    if (typeof user.phoneNumber === 'string') {
      phoneNumber = user.phoneNumber
    } else if (
      typeof user.phoneNumber === 'object' &&
      user.phoneNumber !== null
    ) {
      // Handle object case - try common property names
      phoneNumber = String(
        (
          user.phoneNumber as {
            value?: string
            number?: string
            phone?: string
          }
        ).value ||
          (
            user.phoneNumber as {
              value?: string
              number?: string
              phone?: string
            }
          ).number ||
          (
            user.phoneNumber as {
              value?: string
              number?: string
              phone?: string
            }
          ).phone ||
          ''
      )
    }
  }

  // Map status based on isEmailVerified
  const status = user.isEmailVerified ? 'active' : 'inactive'

  let role: User['role']
  if (user.role === 'SUPER_ADMIN') {
    role = 'superadmin'
  } else if (user.role === 'CONTENT_ADMIN') {
    role = 'content_admin'
  } else if (user.role === 'ADMIN') {
    role = 'admin'
  } else if (user.role === 'ORGANIZATION') {
    role = 'organization'
  } else {
    role = 'individual'
  }

  const org = user.organization
  const organization = org
    ? {
        id: org.id,
        name: org.name,
        logoImageUrl:
          typeof org.logoImageUrl === 'string' ? org.logoImageUrl : null,
        logoImageId:
          typeof org.logoImageId === 'string' ? org.logoImageId : null,
        verificationDocumentUrl:
          typeof org.verificationDocumentUrl === 'string'
            ? org.verificationDocumentUrl
            : org.verificationDocumentUrl
              ? String(org.verificationDocumentUrl)
              : null,
        verificationDocumentId:
          typeof org.verificationDocumentId === 'string'
            ? org.verificationDocumentId
            : org.verificationDocumentId
              ? String(org.verificationDocumentId)
              : null,
        verificationRequestRemarks:
          typeof org.verificationRequestRemarks === 'string'
            ? org.verificationRequestRemarks
            : org.verificationRequestRemarks != null
              ? String(org.verificationRequestRemarks)
              : null,
        verificationRequestedAt:
          typeof org.verificationRequestedAt === 'string'
            ? org.verificationRequestedAt
            : org.verificationRequestedAt
              ? String(org.verificationRequestedAt)
              : null,
      }
    : null

  return {
    id: user.id,
    firstName,
    lastName,
    username,
    email: user.email,
    phoneNumber,
    status: status as 'active' | 'inactive' | 'invited' | 'suspended',
    role,
    serverRole: user.role,
    isVerifiedByAdmin: user.isVerifiedByAdmin,
    profilePhotoUrl: nullableString(user.profilePhotoUrl),
    bannerImageUrl: nullableString(user.bannerImageUrl),
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt),
    organization,
  }
}
