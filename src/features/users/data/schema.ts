import { z } from 'zod'

const userStatusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),
  z.literal('invited'),
  z.literal('suspended'),
])
export type UserStatus = z.infer<typeof userStatusSchema>

const roleEnumSchema = z.union([
  z.literal('SUPER_ADMIN'),
  z.literal('ADMIN'),
  z.literal('CONTENT_ADMIN'),
  z.literal('ORGANIZATION'),
  z.literal('INDIVIDUAL'),
])

const userRoleSchema = z.union([
  z.literal('superadmin'),
  z.literal('admin'),
  z.literal('content_admin'),
  z.literal('individual'),
  z.literal('organization'),
])

const organizationListSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    logoImageUrl: z.string().optional().nullable(),
    logoImageId: z.string().optional().nullable(),
    verificationDocumentUrl: z.string().optional().nullable(),
    verificationDocumentId: z.string().optional().nullable(),
    verificationRequestRemarks: z.string().optional().nullable(),
    verificationRequestedAt: z.string().optional().nullable(),
  })
  .nullable()
  .optional()

const userSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  username: z.string(),
  email: z.string(),
  phoneNumber: z.string(),
  status: userStatusSchema,
  role: userRoleSchema,
  /** API `UserOutput.role` */
  serverRole: roleEnumSchema,
  isVerifiedByAdmin: z.boolean(),
  profilePhotoUrl: z.string().nullable().optional(),
  bannerImageUrl: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  organization: organizationListSchema,
})
export type User = z.infer<typeof userSchema>

export const userListSchema = z.array(userSchema)
