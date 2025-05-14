import { createLazyFileRoute } from '@tanstack/react-router'
import { AddTagDialog } from '@/features/tags/add/add-tag-dialog'

export const Route = createLazyFileRoute('/_authenticated/tags/add/')({
  component: AddTagDialog,
})
