import { z } from 'zod'

export const AddMinutesSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  date: z.date({ required_error: 'Date is required' }),
  meetingTime: z.string().min(1, { message: 'Meeting time is required' }),
  agenda: z.string().min(1, { message: 'Agenda is required' }),
  meetingSummary: z.string().min(1, { message: 'Meeting summary is required' }),
})

export type Minutes = z.infer<typeof AddMinutesSchema>
