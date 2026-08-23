import { createFileRoute, redirect } from '@tanstack/react-router'
import AddVacancy from '@/features/vacancies/add'
import { getRoleFromToken } from '@/utils/jwt.util'
import { isAdminLevel } from '@/utils/role-check.util'

export const Route = createFileRoute('/_authenticated/vacancies/add')({
  beforeLoad: () => {
    const role = getRoleFromToken()
    if (!isAdminLevel(role)) {
      throw redirect({
        to: '/',
      })
    }
  },
  component: AddVacancy,
})
