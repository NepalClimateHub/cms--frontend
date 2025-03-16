import AddOrganizations from '@/features/organizations/add'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/organizations/add/')({
  component: AddOrganizations,
})
