import { createFileRoute } from '@tanstack/react-router'
import NewsAdd from '@/features/news/add'

export const Route = createFileRoute('/_authenticated/news/add/')({
  component: NewsAdd,
})
