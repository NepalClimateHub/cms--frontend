import { createFileRoute, redirect } from '@tanstack/react-router'
import { getRoleFromToken } from '@/utils/jwt.util'
import EditResource from '@/features/resources/edit'

export const Route = createFileRoute('/_authenticated/resources/$id')({
  beforeLoad: () => {
    const role = getRoleFromToken()
    if (role !== 'ADMIN') {
      throw redirect({
        to: '/',
      })
    }
  },
  component: EditResource,
})
