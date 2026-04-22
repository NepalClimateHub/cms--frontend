import { createFileRoute, redirect } from '@tanstack/react-router'
import ResourceList from '@/features/resources/list'
import { getRoleFromToken } from '@/utils/jwt.util'
import { canAccessOrganizationContentRoutes } from '@/utils/role-check.util'

export const Route = createFileRoute('/_authenticated/resources/')({
  beforeLoad: () => {
    const role = getRoleFromToken()
    if (!canAccessOrganizationContentRoutes(role)) {
      throw redirect({
        to: '/',
      })
    }
  },
  component: ResourceList,
})
