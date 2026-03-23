
import { z } from 'zod'
import { ResourceType, ResourceLevel } from '@/query/resources/use-resources'

export const resourceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  overview: z.string().optional(),
  type: z.nativeEnum(ResourceType, {
    required_error: 'Resource Type is required',
  }),
  level: z.nativeEnum(ResourceLevel).optional(),
  
  // Specific fields - all optional in base schema, UI will handle visibility/requirement logic
  link: z.string().url('Invalid URL').optional().or(z.literal('')),
  courseProvider: z.string().optional(),
  platform: z.string().optional(),
  duration: z.string().optional(),
  author: z.string().optional(),
  publicationYear: z.string().optional(),
  
  bannerImageUrl: z.string().optional(),
  bannerImageId: z.string().optional(),
  isDraft: z.boolean().default(true),
  tagIds: z.array(z.string()).optional(),
})

export type ResourceFormValues = z.infer<typeof resourceSchema>
