import { getAccessToken } from '@/stores/authStore'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

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
