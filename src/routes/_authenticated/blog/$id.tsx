import { createFileRoute, redirect } from '@tanstack/react-router'
import EditBlog from '@/features/blogs/edit'
import { getRoleFromToken } from '@/utils/jwt.util'

export const Route = createFileRoute('/_authenticated/blog/$id')({
  beforeLoad: () => {
    const role = getRoleFromToken()
    if (role !== 'ADMIN') {
      throw redirect({
        to: '/',
      })
    }
  },
  component: () => <EditBlog />,
})
