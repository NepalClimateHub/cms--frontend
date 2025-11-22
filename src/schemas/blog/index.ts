import { z } from 'zod'

export const BLOG_CATEGORY = [
  { value: 'climate-science', label: 'Climate Science' },
  { value: 'sustainability', label: 'Sustainability' },
  { value: 'development', label: 'Development' },
  { value: 'environment', label: 'Environment' },
  { value: 'technology', label: 'Technology' },
  { value: 'policy', label: 'Policy' },
  { value: 'research', label: 'Research' },
  { value: 'education', label: 'Education' },
] as const

export const blogSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().optional(),
  author: z.string().min(1, 'Author is required'),
  category: z.string().min(1, 'Category is required'),
  readingTime: z.string().optional(),
  publishedDate: z.date().optional(),
  isDraft: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  bannerImageUrl: z.string().optional(),
  bannerImageId: z.string().optional(),
  contentImageUrl: z.string().optional(),
  contentImageId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
})

export type BlogFormValues = z.infer<typeof blogSchema>
