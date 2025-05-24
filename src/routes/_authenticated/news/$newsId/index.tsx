import { createFileRoute } from '@tanstack/react-router'
import NewsEdit from '@/features/news/edit'

export const Route = createFileRoute('/_authenticated/news/$newsId/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <NewsEdit />
}
