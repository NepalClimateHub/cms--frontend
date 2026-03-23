import { createFileRoute, redirect } from '@tanstack/react-router'
import AddOrganizations from '@/features/events/add'
import { getRoleFromToken } from '@/utils/jwt.util'

export const Route = createFileRoute('/_authenticated/organizations/add/')({
  beforeLoad: () => {
    const role = getRoleFromToken()
    if (role !== 'ADMIN') {
      throw redirect({
        to: '/',
      })
    }
  },
  component: AddOrganizations,
})
