import { z } from 'zod'

export const AddNewsSchema = z.object({
  title: z.string(),
  source: z.string(),
  mode: z.string(),
  publishedDate: z.date(),
  newsLink: z.string().url(),
  bannerImageUrl: z.string().url(),
  bannerImageId: z.string(),
  tagIds: z.array(z.string()),
})

export type News = z.infer<typeof AddNewsSchema>
