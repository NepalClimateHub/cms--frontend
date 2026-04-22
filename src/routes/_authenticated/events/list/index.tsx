import { createFileRoute, redirect } from '@tanstack/react-router'
import ListEvents from '@/features/events/list'
import { getRoleFromToken } from '@/utils/jwt.util'
import { canAccessOrganizationContentRoutes } from '@/utils/role-check.util'

export const Route = createFileRoute('/_authenticated/events/list/')({
  beforeLoad: () => {
    const role = getRoleFromToken()
    if (!canAccessOrganizationContentRoutes(role)) {
      throw redirect({
        to: '/',
      })
    }
  },
  component: ListEvents,
})
