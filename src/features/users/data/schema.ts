import { z } from 'zod'

const userStatusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),
  z.literal('invited'),
  z.literal('suspended'),
])
export type UserStatus = z.infer<typeof userStatusSchema>

const userTypeSchema = z.union([
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

const userSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  username: z.string(),
  email: z.string(),
  phoneNumber: z.string(),
  status: userStatusSchema,
  role: userRoleSchema,
  userType: userTypeSchema,
  isVerifiedByAdmin: z.boolean().optional(),
  profilePhotoUrl: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type User = z.infer<typeof userSchema>

export const userListSchema = z.array(userSchema)
