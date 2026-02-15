
import { createFileRoute } from '@tanstack/react-router'
import EditProject from '@/features/projects/edit'

export const Route = createFileRoute('/_authenticated/projects/$id')({
  component: EditProject,
})
