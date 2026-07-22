import { createFileRoute, redirect } from '@tanstack/react-router'
import AddTestimonial from '@/features/testimonials/add'
import { getRoleFromToken } from '@/utils/jwt.util'
import { isAdminLevel } from '@/utils/role-check.util'

export const Route = createFileRoute('/_authenticated/testimonials/add')({
  beforeLoad: () => {
    const role = getRoleFromToken()
    if (!isAdminLevel(role)) {
      throw redirect({
        to: '/',
      })
    }
  },
  component: AddTestimonial,
})
