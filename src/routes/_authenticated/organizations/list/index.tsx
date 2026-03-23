import { createFileRoute, redirect } from '@tanstack/react-router'
import ListOrganizations from '@/features/organizations/list'
import { getRoleFromToken } from '@/utils/jwt.util'

export const Route = createFileRoute('/_authenticated/organizations/list/')({
  beforeLoad: () => {
    const role = getRoleFromToken()
    if (role !== 'ADMIN') {
      throw redirect({
        to: '/',
      })
    }
  },
  component: ListOrganizations,
})
