import { createFileRoute, redirect } from '@tanstack/react-router'
import { getRoleFromToken } from '@/utils/jwt.util'

export const Route = createFileRoute('/_authenticated/resources/$id')({
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
  return <div>Hello "/_authenticated/resources/$id"!</div>
}
