import { createFileRoute, redirect } from '@tanstack/react-router'
import EditResource from '@/features/resources/edit'
import { getRoleFromToken } from '@/utils/jwt.util'
import { canAccessOrganizationContentRoutes } from '@/utils/role-check.util'

export const Route = createFileRoute('/_authenticated/resources/$id')({
  beforeLoad: () => {
    const role = getRoleFromToken()
    if (!canAccessOrganizationContentRoutes(role)) {
      throw redirect({
        to: '/',
      })
    }
  },
  component: EditResource,
})
