import { createLazyFileRoute } from '@tanstack/react-router'
import ComingSoon from '@/ui/templates/coming-soon'

export const Route = createLazyFileRoute('/_authenticated/help-center/')({
  component: ComingSoon,
})
