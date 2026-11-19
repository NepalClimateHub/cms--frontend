import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import CertificateVerificationPage from '@/features/verify'

const verifySearchSchema = z.object({
  code: z.string().optional(),
})

export const Route = createFileRoute('/verify')({
  validateSearch: (search: Record<string, unknown>) => {
    return verifySearchSchema.parse(search)
  },
  component: VerifyRouteComponent,
})

function VerifyRouteComponent() {
  const { code } = Route.useSearch()
  return <CertificateVerificationPage initialCode={code || ''} />
}
