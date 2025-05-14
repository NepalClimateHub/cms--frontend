import { OrganizationFormValues as Organization } from '@/schemas/organization/organization'

export type User = {
  id: string
  email: string
  fullName: string
  permissions: string[]
  isActive: boolean
  isSuperAdmin: boolean
  organization: Organization | null
  createdAt: string
  updatedAt: string
}
