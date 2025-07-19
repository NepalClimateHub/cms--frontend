import { createFileRoute } from '@tanstack/react-router'
import OtpVerification from '@/ui/pages/auth/VerifyOTP'

export const Route = createFileRoute('/(auth)/otp-verification')({
  component: OtpVerification,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      email: search.email as string,
    }
  },
})
