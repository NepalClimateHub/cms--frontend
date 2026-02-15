import { createFileRoute, redirect } from '@tanstack/react-router'
import ListEvents from '@/features/events/list'
import { getRoleFromToken } from '@/utils/jwt.util'

export const Route = createFileRoute('/_authenticated/events/list/')({
  beforeLoad: () => {
    const role = getRoleFromToken()
    if (role !== 'ADMIN') {
      throw redirect({
        to: '/',
      })
    }
  },
  component: ListEvents,
})
