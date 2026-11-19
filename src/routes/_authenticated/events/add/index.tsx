import { createFileRoute, redirect } from '@tanstack/react-router'
import AddEvent from '@/features/events/add'
import { getRoleFromToken } from '@/utils/jwt.util'
import { canAccessOrganizationContentRoutes } from '@/utils/role-check.util'

export const Route = createFileRoute('/_authenticated/events/add/')({
  beforeLoad: () => {
    const role = getRoleFromToken()
    if (!canAccessOrganizationContentRoutes(role)) {
      throw redirect({
        to: '/',
      })
    }
  },
  component: AddEvent,
})
