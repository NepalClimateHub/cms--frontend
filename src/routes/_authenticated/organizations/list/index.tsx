import { createFileRoute } from '@tanstack/react-router'
import ListOrganizations from '@/features/organizations/list'

export const Route = createFileRoute('/_authenticated/organizations/list/')({
  component: ListOrganizations,
})
