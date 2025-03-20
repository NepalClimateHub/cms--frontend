import AddRole from '@/features/tags/add'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/tags/add/')({
  component: AddRole,
})
