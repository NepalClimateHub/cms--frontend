
import { createFileRoute } from '@tanstack/react-router'
import ProjectList from '@/features/projects/list'

export const Route = createFileRoute('/_authenticated/projects/')({
  component: ProjectList,
})
