import { createFileRoute } from '@tanstack/react-router'
import ListBlog from '@/features/blogs/list'

export const Route = createFileRoute('/_authenticated/blog/list')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ListBlog />
}
