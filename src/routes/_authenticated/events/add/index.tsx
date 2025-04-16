import { createFileRoute } from '@tanstack/react-router'
import AddEvent from '@/features/events/add'

export const Route = createFileRoute('/_authenticated/events/add/')({
  component: AddEvent,
})
