import { createFileRoute } from '@tanstack/react-router'
import ListOpportunity from '@/features/oppourtunities/ListOpportunity'

export const Route = createFileRoute('/_authenticated/opportunities/list/')({
  component: ListOpportunity,
})
