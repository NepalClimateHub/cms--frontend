import { z } from 'zod'
import { addressSchema } from '../shared'

export const AddNewsSchema = z.object({
  title: z.string(),
  source: z.string(),
  mode: z.string(),
  publishedDate: z.date(),
  newsLink: z.string().url(),
  bannerImageUrl: z.string().url().optional().nullable(),
  bannerImageId: z.string().optional().nullable(),
  tagIds: z.array(z.string()),
  address: addressSchema,
})

export type News = z.infer<typeof AddNewsSchema>
