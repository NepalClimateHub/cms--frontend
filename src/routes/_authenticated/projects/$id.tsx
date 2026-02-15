import { createFileRoute, redirect } from '@tanstack/react-router'
import EditProject from '@/features/projects/edit'
import { getRoleFromToken } from '@/utils/jwt.util'

export const Route = createFileRoute('/_authenticated/projects/$id')({
  beforeLoad: () => {
    const role = getRoleFromToken()
    if (role !== 'ADMIN') {
      throw redirect({
        to: '/',
      })
    }
  },
  component: EditProject,
})
