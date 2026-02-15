import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/resources/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/resources/$id"!</div>
}
