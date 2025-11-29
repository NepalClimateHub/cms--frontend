import { z } from 'zod'
import { addressSchema } from '../shared'

export const modeOptions = [
  { value: 'National', label: 'National' },
  { value: 'International', label: 'International' },
  { value: 'Regional', label: 'Regional' },
]

export const AddNewsSchema = z.object({
  title: z.string(),
  source: z.string(),
  mode: z.string(),
  publishedDate: z.date(),
  newsLink: z.string().url(),
  tagIds: z.array(z.string()).optional(),
  address: addressSchema.optional(),
  isDraft: z.boolean().optional().default(false),
})

export type News = z.infer<typeof AddNewsSchema>
