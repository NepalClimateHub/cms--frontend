import { createFileRoute, redirect } from '@tanstack/react-router'
import AddBlog from '@/features/blogs/add'
import { getRoleFromToken } from '@/utils/jwt.util'

export const Route = createFileRoute('/_authenticated/blog/add')({
  beforeLoad: () => {
    const role = getRoleFromToken()
    if (role !== 'ADMIN') {
      throw redirect({
        to: '/',
      })
    }
  },
  component: () => <AddBlog />,
})
