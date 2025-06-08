import { z } from 'zod'
import { socialSchema } from '../shared'

export const OPPORTUNITY_STATUS = [
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
  { value: 'upcoming', label: 'Upcoming' },
]

export const OPPORTUNITY_FORMAT = [
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'Offline' },
  { value: 'hybrid', label: 'Hybrid' },
]

export const OPPORTUNITY_COST = [
  { value: 'fully_funded', label: 'Fully Funded' },
  { value: 'partially_funded', label: 'Partially Funded' },
  { value: 'paid', label: 'Paid' },
  { value: 'free', label: 'Free' },
]

export const OPPORTUNITY_TYPE = [
  { value: 'JOB', label: 'Job' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'FELLOWSHIP', label: 'Fellowship' },
  { value: 'GRANT', label: 'Grant' },
  { value: 'SCHOLARSHIP', label: 'Scholarship' },
  {
    value: 'VOLUNTEER',
    label: 'Volunteer',
  },
  {
    value: 'TRAINING',
    label: 'Training',
  },
  {
    value: 'AWARDS',
    label: 'Awards',
  },
  {
    value: 'COMPETITIONS',
    label: 'Competitions',
  },
  {
    value: 'ONLINE_COURSE',
    label: 'Online Course',
  },
]

// const costOptions = [
//   { value: 'FULLY_FUNDED', label: 'Fully Funded' },
//   { value: 'PARTIALLY_FUNDED', label: 'Partially Funded' },
//   { value: 'PAID', label: 'Paid' },
//   { value: 'FREE', label: 'Free' },
// ]

// const statusOptions = [
//   { value: 'OPEN', label: 'Open' },
//   { value: 'CLOSED', label: 'Closed' },
// ]

export const opportunitySchema = z.object({
  title: z.string().min(1, "Title is required"),
  organizer: z.string().min(1, "Organizer is required"),
  type: z.string().min(1, "Type is required"),
  format: z.string().min(1, "Format is required"),
  cost: z.string().min(1, "Cost is required"),
  status: z.string().min(1, "Status is required"),
  locationType: z.string().min(1, "Location Type is required"),
  description: z.string().min(1, "Description is required"),
  tagIds: z.array(z.string()).min(1, "At least one tag is required"),
  
  location: z.string().optional(),
  applicationDeadline: z.date().nullable().optional(),
  duration: z.string().nullable().optional(),
  contactEmail: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  address: z.object({
    state: z.string().optional(),
    country: z.string().optional(),
    city: z.string().optional(),
    street: z.string().optional(),
    postcode: z.string().optional(),
  }),
  socials: socialSchema,
  bannerImageUrl: z.string().optional(),
  bannerImageId: z.string().optional(),
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
