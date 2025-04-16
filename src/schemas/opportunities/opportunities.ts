import { z } from 'zod'

export const opportunitySchema = z.object({
  name: z.string(),
  description: z.string(),
  address: z.string(),
  contact: z.object({
    email: z.string(),
    phone: z.string(),
  }),
  socials: z.object({
    facebook: z.string(),
    linkedin: z.string(),
    instagram: z.string(),
  }),
  website: z.string(),
  tags: z.array(z.string()),
  logoUrl: z.string().nullable(),
  pictures: z.array(z.string()),
  slug: z.string(),
  applicationLink: z.string(),
  applicationDeadline: z.string(),
  organizer: z.string(),
  cost: z.string(),
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
