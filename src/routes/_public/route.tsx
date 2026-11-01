import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { getAccessToken } from '@/stores/authStore'

export const Route = createFileRoute('/_public')({
  component: RouteComponent,
  beforeLoad: () => {
    const accessToken = getAccessToken()
    if (accessToken) {
      redirect({
        to: '/',
        throw: true,
      })
    }
  },
})

function RouteComponent() {
  return (
    <div>
      <Outlet />
    </div>
  )
}
