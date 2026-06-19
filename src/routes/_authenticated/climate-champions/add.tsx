import { createFileRoute, redirect } from '@tanstack/react-router'
import AddClimateChampion from '@/features/climate-champions/add'
import { getRoleFromToken } from '@/utils/jwt.util'
import { isAdminLevel } from '@/utils/role-check.util'

export const Route = createFileRoute('/_authenticated/climate-champions/add')({
  beforeLoad: () => {
    const role = getRoleFromToken()
    if (!isAdminLevel(role)) {
      throw redirect({
        to: '/',
      })
    }
  },
  component: AddClimateChampion,
})
