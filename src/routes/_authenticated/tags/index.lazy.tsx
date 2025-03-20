import Tags from '@/features/tags/list'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/tags/')({
  component: Tags,
})
