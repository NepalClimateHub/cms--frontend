import { createFileRoute, redirect } from '@tanstack/react-router'
import AddOpportunity from '@/features/oppourtunities/add'
import { getRoleFromToken } from '@/utils/jwt.util'

export const Route = createFileRoute('/_authenticated/opportunities/add/')({
  beforeLoad: () => {
    const role = getRoleFromToken()
    if (role !== 'ADMIN') {
      throw redirect({
        to: '/',
      })
    }
  },
  component: AddOpportunity,
})
