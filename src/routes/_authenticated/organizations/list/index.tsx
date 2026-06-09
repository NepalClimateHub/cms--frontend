import { createFileRoute, redirect } from '@tanstack/react-router'
import ListOrganizations from '@/features/organizations/list'
import { getRoleFromToken } from '@/utils/jwt.util'
import { isAdminLevel } from '@/utils/role-check.util'

export const Route = createFileRoute('/_authenticated/organizations/list/')({
  beforeLoad: () => {
    const role = getRoleFromToken()
    if (!isAdminLevel(role)) {
      throw redirect({
        to: '/',
      })
    }
  },
  component: ListOrganizations,
})
