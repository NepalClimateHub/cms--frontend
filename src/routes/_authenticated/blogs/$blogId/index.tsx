import { createFileRoute } from '@tanstack/react-router'
import EditBlog from '@/features/blogs/edit'

export const Route = createFileRoute('/_authenticated/blogs/$blogId/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <EditBlog />
}
