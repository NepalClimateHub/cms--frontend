import { OrganizationFormValues as Organization } from '@/schemas/organization/organization'

export type User = {
  id: string
  email: string
  fullName: string
  permissions: string[]
  isActive: boolean
  isSuperAdmin: boolean
  organization: Organization | null
  bio?: string | null
  linkedin?: string | null
  currentRole?: string | null
  profilePhotoUrl?: string | null
  profilePhotoId?: string | null
  createdAt: string
  updatedAt: string
}
