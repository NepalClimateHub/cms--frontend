import { z } from 'zod'
import { addressSchema, socialSchema } from '../shared'

export const eventFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  organizer: z.string().min(1, 'Organizer is required'),
  type: z.string().min(1, 'Type is required'),
  format: z.string().min(1, 'Format is required'),
  cost: z.string().min(1, 'Cost is required'),
  status: z.string().min(1, 'Status is required'),
  locationType: z.string().min(1, 'Location Type is required'),
  description: z.string().min(1, 'Description is required'),
  tagIds: z.array(z.string()).min(1, 'At least one tag is required'),

  location: z.string().optional(),
  startDate: z.date().optional(),
  registrationDeadline: z.date().optional(),
  registrationLink: z.string().optional(),
  contactEmail: z.string().optional(),
  website: z.string().optional(),
  bannerImageId: z.string().nullable().optional(),
  bannerImageUrl: z.string().nullable().optional(),
  address: addressSchema.optional(),
  socials: socialSchema,
})

export type EventFormValues = z.infer<typeof eventFormSchema>

export const EVENT_FORMAT_TYPE = [
  { label: 'In-Person', value: 'IN_PERSON' },
  { label: 'Virtual', value: 'VIRTUAL' },
  { label: 'Hybrid', value: 'HYBRID' },
]
export const EventFormatTypeSchema = z.enum(['IN_PERSON', 'VIRTUAL', 'HYBRID'])
export type FormatType = z.infer<typeof EventFormatTypeSchema>

export const EVENT_STATUS = [
  { label: 'Open', value: 'OPEN' },
  { label: 'Upcoming', value: 'UPCOMING' },
  { label: 'Closed', value: 'CLOSED' },
]
export const EventStatusSchema = z.enum(['OPEN', 'UPCOMING', 'CLOSED'])
export type EventStatus = z.infer<typeof EventStatusSchema>

export const EVENT_TYPE = [
  { label: 'Conference', value: 'CONFERENCE' },
  { label: 'Side Event', value: 'SIDE_EVENT' },
  { label: 'Seminar', value: 'SEMINAR' },
  { label: 'Summit', value: 'SUMMIT' },
  { label: 'Symposium', value: 'SYMPOSIUM' },
  { label: 'Webinar', value: 'WEBINAR' },
  { label: 'Workshop', value: 'WORKSHOP' },
  { label: 'Discussion', value: 'DISCUSSION' },
]
export const EventTypeSchema = z.enum([
  'CONFERENCE',
  'SIDE_EVENT',
  'SEMINAR',
  'SUMMIT',
  'SYMPOSIUM',
  'WEBINAR',
  'WORKSHOP',
])
export type EventType = z.infer<typeof EventTypeSchema>

export const EVENT_COST = [
  { label: 'Fully Funded', value: 'FULLY_FUNDED' },
  { label: 'Partially Funded', value: 'PARTIALLY_FUNDED' },
  { label: 'Paid', value: 'PAID' },
  { label: 'Free', value: 'FREE' },
]
export const EventCostSchema = z.enum([
  'FULLY_FUNDED',
  'PARTIALLY_FUNDED',
  'PAID',
  'FREE',
])
export type EventCost = z.infer<typeof EventCostSchema>
