import { z } from 'zod'

export const MEMBER_TEAMS = [
  'Leadership',
  'Executive',
  'Tech',
  'Climate Communication',
  'Content',
  'Advisor',
] as const

export const MEMBER_STATUSES = [
  'Staff',
  'Advisor',
  'Volunteer',
  'Board',
] as const

export const memberSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: 'Name is required' }),
  email: z.string().email({ message: 'Valid email is required' }),
  currentAddress: z.string().optional(),
  permanentAddress: z.string().optional(),
  phoneNumber: z.string().optional(),
  linkedinProfile: z.string().optional(),
  photoUrl: z.string().optional(),
  photoId: z.string().optional(),
  bio: z.string().max(400, { message: 'Bio cannot exceed 400 characters' }).optional(),
  role: z.string().min(1, { message: 'Role is required' }),
  startDate: z.string().min(1, { message: 'Start date is required' }),
  endDate: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
  team: z.enum(['Leadership', 'Executive', 'Tech', 'Climate Communication', 'Content', 'Advisor']),
  status: z.enum(['Staff', 'Advisor', 'Volunteer', 'Board']),
  order: z.number().default(0),
})

export type MemberFormValues = z.infer<typeof memberSchema>
