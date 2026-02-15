import { createFileRoute } from '@tanstack/react-router'
import ResourceList from '@/features/resources/list'

export const Route = createFileRoute('/_authenticated/resources/')({
  component: ResourceList,
})
