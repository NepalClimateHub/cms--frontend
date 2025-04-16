import { createFileRoute } from '@tanstack/react-router'
import NewsList from '@/features/news/list'

export const Route = createFileRoute('/_authenticated/news/list/')({
  component: NewsList,
})
