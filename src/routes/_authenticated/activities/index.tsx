import { createFileRoute, redirect } from '@tanstack/react-router'
import ActivitiesFeature from '@/features/activities'
import { getRoleFromToken } from '@/utils/jwt.util'
import { isSuperAdmin } from '@/utils/role-check.util'

export const Route = createFileRoute('/_authenticated/activities/')({
  beforeLoad: () => {
    const role = getRoleFromToken()
    if (!isSuperAdmin(role)) {
      throw redirect({
        to: '/',
      })
    }
  },
  component: ActivitiesFeature,
})
