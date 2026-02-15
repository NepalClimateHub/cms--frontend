
import { createFileRoute } from '@tanstack/react-router'
import AddProject from '@/features/projects/add'

export const Route = createFileRoute('/_authenticated/projects/add')({
  component: AddProject,
})
