import { z } from 'zod'

export const testimonialSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: 'Name is required' }),
  photoUrl: z.string().optional().or(z.literal('')),
  photoId: z.string().optional().or(z.literal('')),
  description: z.string().min(1, { message: 'Description is required' }),
  stars: z.number().min(1, { message: 'Stars rating must be at least 1' }).max(5, { message: 'Stars rating cannot exceed 5' }).default(5),
  isActive: z.boolean().default(true),
  order: z.number().default(0),
})

export type TestimonialFormValues = z.infer<typeof testimonialSchema>
