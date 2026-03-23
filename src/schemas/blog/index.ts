import { z } from 'zod'

export const blogSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().optional(),
  author: z.string().min(1, 'Author is required'),
  category: z.string().min(1, 'Category is required'),
  categoryId: z.string().min(1, 'Category selection is required'),
  readingTime: z.string().optional(),
  publishedDate: z.date().optional(),
  isDraft: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isTopRead: z.boolean().default(false),
  bannerImageUrl: z.string().optional(),
  bannerImageId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
})

export type BlogFormValues = z.infer<typeof blogSchema>
