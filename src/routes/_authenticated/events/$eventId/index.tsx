import { createFileRoute, redirect } from '@tanstack/react-router'
import EditEvent from '@/features/events/edit'
import { getRoleFromToken } from '@/utils/jwt.util'

export const Route = createFileRoute('/_authenticated/events/$eventId/')({
  beforeLoad: () => {
    const role = getRoleFromToken()
    if (role !== 'ADMIN') {
      throw redirect({
        to: '/',
      })
    }
  },
  component: EditEvent,
})

