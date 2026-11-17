import { createLazyFileRoute } from '@tanstack/react-router'
import ResetPassword from '@/features/auth/reset-password'

export const Route = createLazyFileRoute('/(auth)/reset-password')({
  component: ResetPassword,
})
