import { createLazyFileRoute } from '@tanstack/react-router'
import SignUp from '@/ui/pages/auth/Signup'

export const Route = createLazyFileRoute('/(auth)/sign-up')({
  component: SignUp,
})
