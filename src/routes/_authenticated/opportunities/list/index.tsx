import { createFileRoute, redirect } from '@tanstack/react-router'
import ListOpportunity from '@/features/oppourtunities/list'
import { getRoleFromToken } from '@/utils/jwt.util'

export const Route = createFileRoute('/_authenticated/opportunities/list/')({
  beforeLoad: () => {
    const role = getRoleFromToken()
    if (role !== 'ADMIN') {
      throw redirect({
        to: '/',
      })
    }
  },
  component: ListOpportunity,
})
