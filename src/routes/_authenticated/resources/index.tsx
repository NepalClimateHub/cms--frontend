import { createFileRoute, redirect } from '@tanstack/react-router'
import ResourceList from '@/features/resources/list'
import { getRoleFromToken } from '@/utils/jwt.util'

export const Route = createFileRoute('/_authenticated/resources/')({
  beforeLoad: () => {
    const role = getRoleFromToken()
    if (role !== 'ADMIN') {
      throw redirect({
        to: '/',
      })
    }
  },
  component: ResourceList,
})
