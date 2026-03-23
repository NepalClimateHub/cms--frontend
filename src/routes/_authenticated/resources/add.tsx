import { createFileRoute } from '@tanstack/react-router'
import AddResource from '@/features/resources/add'

export const Route = createFileRoute('/_authenticated/resources/add')({
  component: AddResource,
})
