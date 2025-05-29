import { z } from 'zod'

export const OPPORTUNITY_STATUS = [
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'ongoing', label: 'Ongoing' },
]

export const OPPORTUNITY_FORMAT = [
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'Offline' },
  { value: 'hybrid', label: 'Hybrid' },
]

export const OPPORTUNITY_COST = [
  { value: 'free', label: 'Free' },
  { value: 'paid', label: 'Paid' },
  { value: 'scholarship', label: 'Scholarship Available' },
]

export const opportunitySchema = z.object({
  title: z.string(),
  description: z.string(),
  location: z.string(),
  locationType: z.string(),
  type: z.string(),
  format: z.string(),
  applicationDeadline: z.date().nullable(),
  duration: z.string().nullable(),
  contactEmail: z.string().nullable(),
  website: z.string().nullable(),
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
    facebook: z.string().optional(),
    linkedin: z.string().optional(),
    instagram: z.string().optional(),
  }),
  bannerImageUrl: z.string().optional(),
  bannerImageId: z.string().optional(),
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
