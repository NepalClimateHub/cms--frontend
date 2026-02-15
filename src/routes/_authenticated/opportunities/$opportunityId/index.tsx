import { createFileRoute, redirect } from '@tanstack/react-router'
import OpportunityEdit from '@/features/oppourtunities/edit'
import { getRoleFromToken } from '@/utils/jwt.util'

export const Route = createFileRoute(
  '/_authenticated/opportunities/$opportunityId/'
)({
  beforeLoad: () => {
    const role = getRoleFromToken()
    if (role !== 'ADMIN') {
      throw redirect({
        to: '/',
      })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <OpportunityEdit />
}
