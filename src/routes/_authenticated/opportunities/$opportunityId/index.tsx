import { createFileRoute, redirect } from '@tanstack/react-router'
import OpportunityEdit from '@/features/oppourtunities/edit'
import { getRoleFromToken } from '@/utils/jwt.util'
import { canAccessOrganizationContentRoutes } from '@/utils/role-check.util'

export const Route = createFileRoute(
  '/_authenticated/opportunities/$opportunityId/'
)({
  beforeLoad: () => {
    const role = getRoleFromToken()
    if (!canAccessOrganizationContentRoutes(role)) {
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
