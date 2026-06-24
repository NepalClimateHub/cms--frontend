import { z } from 'zod'

export const climateChampionSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: 'Name is required' }),
  email: z
    .string()
    .email({ message: 'Valid email is required' })
    .optional()
    .or(z.literal('')),
  location: z.string().optional().or(z.literal('')),
  bio: z.string().optional().or(z.literal('')),
  photoUrl: z.string().optional().or(z.literal('')),
  photoId: z.string().optional().or(z.literal('')),
  tags: z.array(z.string()).default([]),
  website: z.string().optional().or(z.literal('')),
  facebook: z.string().optional().or(z.literal('')),
  instagram: z.string().optional().or(z.literal('')),
  linkedin: z.string().optional().or(z.literal('')),
  isActive: z.boolean().default(true),
  order: z.number().default(0),
})

export type ClimateChampionFormValues = z.infer<typeof climateChampionSchema>
