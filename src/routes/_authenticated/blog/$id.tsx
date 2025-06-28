import { createFileRoute } from '@tanstack/react-router'
import EditBlog from '@/features/blogs/edit'

export const Route = createFileRoute('/_authenticated/blog/$id')({
  component: () => <EditBlog />,
})
