import Roles from '@/features/roles/list'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/roles/')({
  component: Roles,
})