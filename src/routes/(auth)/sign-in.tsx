import { createFileRoute } from '@tanstack/react-router'
import SignIn2 from '@/ui/pages/auth/Signin'

export const Route = createFileRoute('/(auth)/sign-in')({
  component: SignIn2,
})
