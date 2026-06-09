import { createFileRoute, redirect } from '@tanstack/react-router'
import EditBlog from '@/features/blogs/edit'
import { getRoleFromToken } from '@/utils/jwt.util'
import { canAccessBlogAuthoring } from '@/utils/role-check.util'

export const Route = createFileRoute('/_authenticated/blogs/$blogId/')({
  beforeLoad: () => {
    const role = getRoleFromToken()
    if (!canAccessBlogAuthoring(role)) {
      throw redirect({
        to: '/',
      })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <EditBlog />
}
