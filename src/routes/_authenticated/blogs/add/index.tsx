import { createFileRoute } from '@tanstack/react-router'
import AddBlog from '@/features/blogs/add'

export const Route = createFileRoute('/_authenticated/blogs/add/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <AddBlog />
}
