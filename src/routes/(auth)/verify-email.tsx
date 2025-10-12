import { createFileRoute } from '@tanstack/react-router'
import VerifyEmail from '@/ui/pages/auth/VerifyEmail'

export const Route = createFileRoute('/(auth)/verify-email')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      email: search.email as string,
    }
  },
})

function RouteComponent() {
  return <VerifyEmail />
}
