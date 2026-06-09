import { createFileRoute } from '@tanstack/react-router'
import AddBlog from '@/features/blogs/add'

export const Route = createFileRoute('/_authenticated/blog/add')({
  component: () => <AddBlog />,
})
