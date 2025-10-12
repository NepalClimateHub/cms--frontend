import { createFileRoute } from '@tanstack/react-router'
import ProfilePage from '@/ui/pages/profile'

export const Route = createFileRoute('/_authenticated/profile')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ProfilePage />
}
