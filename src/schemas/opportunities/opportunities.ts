import { z } from 'zod'

export const opportunitySchema = z.object({
  title: z.string(),
  description: z.string(),
  location: z.string(),
  locationType: z.string(),
  type: z.string(),
  format: z.string(),
  applicationDeadline: z.string().nullable(),
  duration: z.string().nullable(),
  contactEmail: z.string().nullable(),
  status: z.string().nullable(),
  cost: z.string().nullable(),
  contributedBy: z.string(),
  organizer: z.string(),
  address: z.object({
    state: z.string().optional(),
    country: z.string().optional(),
    city: z.string().optional(),
    street: z.string().optional(),
    postcode: z.string().optional(),
  }),
  socials: z.object({
    facebook: z.string(),
    linkedin: z.string(),
    instagram: z.string(),
  }),
  bannerImageUrl: z.string().nullable(),
  bannerImageId: z.string().nullable(),
  tagIds: z.array(z.string()),
})

export type OpportunityFormValues = z.infer<typeof opportunitySchema>

// "name": "The Green Fellows Program",
// "description": "The Green Fellows Program is designed to recognize and support individuals committed to addressing global sustainability challenges. By participating in our conference series and engaging with experts, fellows gain valuable knowledge, expand their networks, and enhance their research skills.",
// "address": "Virtual",
// "contact": {
//   "email": "greeninstituteng@gmail.com",
//   "phone": "234 814 777 4444"
// },
// "socials": {
//   "facebook": "https://www.facebook.com/theGreenHQ/",
//   "linkedin": "",
//   "instagram": "https://www.instagram.com/thegreenHQ"
// },
// "website": "https://greeninstitute.ng",
// "tags": ["Fellowship", "International"],
// "logoUrl": "",
// "pictures": [""],
// "slug": "the-green-fellows-program",
//   "applicationLink": "https://greeninstitute.ng/green-fellow-2025"
