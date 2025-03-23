import AddOrganizations from '@/features/events/add'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/organizations/add/')({
  component: AddOrganizations,
})
