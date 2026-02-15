
import { createFileRoute, redirect } from '@tanstack/react-router'
import ProjectList from '@/features/projects/list'
import { getRoleFromToken } from '@/utils/jwt.util'

export const Route = createFileRoute('/_authenticated/projects/')({
  beforeLoad: () => {
    const role = getRoleFromToken()
    if (role !== 'ADMIN') {
      throw redirect({
        to: '/',
      })
    }
  },
  component: ProjectList,
})
