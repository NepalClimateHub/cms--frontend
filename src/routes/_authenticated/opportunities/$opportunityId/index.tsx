import { createFileRoute } from '@tanstack/react-router'
import OpportunityEdit from '@/features/oppourtunities/edit'

export const Route = createFileRoute(
  '/_authenticated/opportunities/$opportunityId/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <OpportunityEdit />
}
