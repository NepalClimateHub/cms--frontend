import { createFileRoute, redirect } from '@tanstack/react-router'
import ClimateChampionList from '@/features/climate-champions/list'
import { getRoleFromToken } from '@/utils/jwt.util'
import { isAdminLevel } from '@/utils/role-check.util'

export const Route = createFileRoute('/_authenticated/climate-champions/')({
  beforeLoad: () => {
    const role = getRoleFromToken()
    if (!isAdminLevel(role)) {
      throw redirect({
        to: '/',
      })
    }
  },
  component: ClimateChampionList,
})
