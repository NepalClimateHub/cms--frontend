import { createFileRoute } from '@tanstack/react-router'
import ListEvents from '@/features/events/list'

export const Route = createFileRoute('/_authenticated/events/list/')({
  component: ListEvents,
})
