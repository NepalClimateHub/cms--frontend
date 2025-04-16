import { z } from 'zod'

export const NewsSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type News = z.infer<typeof NewsSchema>
