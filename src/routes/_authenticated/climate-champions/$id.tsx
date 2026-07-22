import { createFileRoute, redirect } from '@tanstack/react-router'
import EditClimateChampion from '@/features/climate-champions/edit'
import { getRoleFromToken } from '@/utils/jwt.util'
import { isAdminLevel } from '@/utils/role-check.util'

export const Route = createFileRoute('/_authenticated/climate-champions/$id')({
  beforeLoad: () => {
    const role = getRoleFromToken()
    if (!isAdminLevel(role)) {
      throw redirect({
        to: '/',
      })
    }
  },
  component: EditClimateChampion,
})
