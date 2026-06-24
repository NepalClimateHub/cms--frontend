import { createFileRoute } from '@tanstack/react-router'
import UserProfilePage from '../../../ui/pages/dashboard/UserProfilePage'

type ProfileSearch = {
  highlightEdit?: boolean
}

export const Route = createFileRoute('/_authenticated/dashboard/profile')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): ProfileSearch => {
    return {
      highlightEdit:
        search.highlightEdit === 'true' || search.highlightEdit === true,
    }
  },
})

function RouteComponent() {
  return <UserProfilePage />
}
