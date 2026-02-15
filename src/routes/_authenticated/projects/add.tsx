import { createFileRoute, redirect } from '@tanstack/react-router'
import AddProject from '@/features/projects/add'
import { getRoleFromToken } from '@/utils/jwt.util'

export const Route = createFileRoute('/_authenticated/projects/add')({
  beforeLoad: () => {
    const role = getRoleFromToken()
    if (role !== 'ADMIN') {
      throw redirect({
        to: '/',
      })
    }
  },
  component: AddProject,
})
