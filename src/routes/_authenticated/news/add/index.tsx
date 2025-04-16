import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/news/add/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/news/add/"!</div>
}
