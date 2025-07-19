import { createFileRoute } from '@tanstack/react-router'
import Dashboard from '@/ui/pages/admin-dashboard'

export const Route = createFileRoute('/_authenticated/')({
  component: Dashboard,
})
