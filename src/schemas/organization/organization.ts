import { z } from 'zod'

export const organizationSchema = z.object({
  name: z.string(),
  description: z.string(),
  email: z.string().optional(),
  phoneCountryCode: z.string().optional(),
  phoneNumber: z.string().optional(),
  address: z.string(),
  socials: z.object({}),
  bannerImageUrl: z.string(),
  bannerImageId: z.string(),
  logoImageUrl: z.string(),
  logoImageId: z.string(),
  tags: z.array(z.string()),
  organizationGallery: z.array(z.string()),
  slug: z.string(),
  website: z.string(),
})

export type OrganizationFormValues = z.infer<typeof organizationSchema>
