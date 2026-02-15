import { createFileRoute, redirect } from '@tanstack/react-router'
import NewsEdit from '@/features/news/edit'
import { getRoleFromToken } from '@/utils/jwt.util'

export const Route = createFileRoute('/_authenticated/news/$newsId/')({
  beforeLoad: () => {
    const role = getRoleFromToken()
    if (role !== 'ADMIN') {
      throw redirect({
        to: '/',
      })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <NewsEdit />
}
