import AddRole from '@/features/roles/add'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/roles/add/')({
  component: AddRole,
})
