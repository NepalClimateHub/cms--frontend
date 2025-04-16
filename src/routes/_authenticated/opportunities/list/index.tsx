import { createFileRoute } from '@tanstack/react-router'
import ListOpportunity from '@/features/oppourtunities/list'

export const Route = createFileRoute('/_authenticated/opportunities/list/')({
  component: ListOpportunity,
})
