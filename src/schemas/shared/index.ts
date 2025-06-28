import { z } from 'zod'

export type Meta = {
  count: number
}

export const LOCATION_TYPE = [
  { label: 'National', value: 'NATIONAL' },
  { label: 'International', value: 'INTERNATIONAL' },
]
export const LocationTypeSchema = z.enum(['NATIONAL', 'INTERNATIONAL'])
export type LocationType = z.infer<typeof LocationTypeSchema>

export const PROVINCE = [
  { label: 'Koshi', value: 'KOSHI' },
  { label: 'Madhesh', value: 'MADHESH' },
  { label: 'Bagmati', value: 'BAGMATI' },
  { label: 'Gandaki', value: 'GANDAKI' },
  { label: 'Lumbini', value: 'LUMBINI' },
  { label: 'Karnali', value: 'KARNALI' },
  { label: 'Sudurpaschim', value: 'SUDURPASCHIM' },
]
export const ProvinceSchema = z.enum([
  'KOSHI',
  'MADHESH',
  'BAGMATI',
  'GANDAKI',
  'LUMBINI',
  'KARNALI',
  'SUDURPASCHIM',
])
export type Province = z.infer<typeof ProvinceSchema>

export const addressSchema = z.object({
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
})

export type AddressType = z.infer<typeof addressSchema>

export const socialSchema = z
  .object({
    facebook: z.string().url().or(z.literal('')).optional(),
    instagram: z.string().url().or(z.literal('')).optional(),
    linkedin: z.string().url().or(z.literal('')).optional(),
  })
  .optional()
  .nullable()

export type SocialType = z.infer<typeof socialSchema>
