import { createFileRoute, redirect } from '@tanstack/react-router'
import EditMember from '@/features/members/edit'
import { getRoleFromToken } from '@/utils/jwt.util'
import { isAdminLevel } from '@/utils/role-check.util'

export const Route = createFileRoute('/_authenticated/members/$id')({
  beforeLoad: () => {
    const role = getRoleFromToken()
    if (!isAdminLevel(role)) {
      throw redirect({
        to: '/',
      })
    }
  },
  component: EditMember,
})
