import { createFileRoute } from '@tanstack/react-router'
import UserProfilePage from '../../../ui/pages/dashboard/UserProfilePage'

export const Route = createFileRoute('/_authenticated/dashboard/profile')({
  component: RouteComponent,
})

function RouteComponent() {
  return <UserProfilePage />
}
