import ListOrganizations from '@/features/events/list'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/organizations/list/')({
  component: ListOrganizations,
})


