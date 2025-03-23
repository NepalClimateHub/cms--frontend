import { z } from 'zod'

export const eventFormSchema = z.object({
  title: z.string(),
  organizer: z.string(),
  description: z.string(),
  location: z.string(),
  locationType: z.string(),
  type: z.string(),
  format: z.string(),
  startDate: z.date().optional(),
  registrationDeadline: z.date().optional(),
  contactEmail: z.string().optional(),
  status: z.string().optional(),
  cost: z.string().optional(),
  bannerImageId: z.string().nullable(),
  bannerImageUrl: z.string().nullable(),
  contributedBy: z.string(),
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
