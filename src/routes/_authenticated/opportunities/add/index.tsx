import { createFileRoute } from '@tanstack/react-router'
import AddOpportunity from '@/features/oppourtunities/add/AddOpportunitiy'

export const Route = createFileRoute('/_authenticated/opportunities/add/')({
  component: AddOpportunity,
})
