import { createFileRoute, redirect } from '@tanstack/react-router'
import EditVacancy from '@/features/vacancies/edit'
import { getRoleFromToken } from '@/utils/jwt.util'
import { isAdminLevel } from '@/utils/role-check.util'

type VacancyEditSearch = {
  applicationForm?: boolean
}

export const Route = createFileRoute('/_authenticated/vacancies/$id')({
  validateSearch: (search: Record<string, unknown>): VacancyEditSearch => ({
    applicationForm:
      search.applicationForm === 'true' || search.applicationForm === true,
  }),
  beforeLoad: () => {
    const role = getRoleFromToken()
    if (!isAdminLevel(role)) {
      throw redirect({
        to: '/',
      })
    }
  },
  component: EditVacancy,
})
