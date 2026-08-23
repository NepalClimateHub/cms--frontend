import { z } from 'zod'

export const vacancyFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  openings: z.coerce.number().min(1, 'At least 1 opening required'),
  duration: z.string().optional(),
  hoursPerWeek: z.string().optional(),
  overview: z.string().optional(),
  responsibilities: z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([]),
  location: z.string().optional(),
  type: z.string().optional(),
  deadline: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  isDraft: z.boolean().default(false),
})

export type VacancyFormValues = z.infer<typeof vacancyFormSchema>

export const vacancyApplyFormSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  contact: z.string().min(1, 'Contact number is required'),
  currentAddress: z.string().min(1, 'Current address is required'),
  message: z.string().min(1, 'Message is required'),
  cvUrl: z.string().min(1, 'CV upload is required'),
  cvFileId: z.string().optional().nullable(),
})

export type VacancyApplyFormValues = z.infer<typeof vacancyApplyFormSchema>
