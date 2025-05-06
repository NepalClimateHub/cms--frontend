import EditEvent from '@/features/events/edit'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/events/$eventId/')({
  component: EditEvent,
})

