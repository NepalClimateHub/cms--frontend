import { createFileRoute, redirect } from '@tanstack/react-router'
import { getRoleFromToken } from '@/utils/jwt.util'
import { isAdminLevel } from '@/utils/role-check.util'
import AddEvent from '@/features/events/add'

export const Route = createFileRoute('/_authenticated/events/add/')({
  beforeLoad: () => {
    const role = getRoleFromToken()
    if (!isAdminLevel(role)) {
      throw redirect({
        to: '/',
      })
    }
  },
  component: AddEvent,
})
