import { createFileRoute } from '@tanstack/react-router'
import SignIn2 from '@/features/auth/sign-in'

export const Route = createFileRoute('/(auth)/sign-in')({
  component: SignIn2,
})
