
import { z } from 'zod'

export const PROJECT_STATUS = [
  { label: 'Ongoing', value: 'ONGOING' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Upcoming', value: 'UPCOMING' },
] as const

export const projectSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, { message: 'Title is required' }),
  duration: z.string().optional(),
  overview: z.string().min(1, { message: 'Overview is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
  status: z.enum(['ONGOING', 'COMPLETED', 'UPCOMING']).default('ONGOING'),
  bannerImageUrl: z.string().optional(),
  bannerImageId: z.string().optional(),
  isDraft: z.boolean().default(true),
  tagIds: z.array(z.string()).optional(),
})

export type ProjectFormValues = z.infer<typeof projectSchema>
