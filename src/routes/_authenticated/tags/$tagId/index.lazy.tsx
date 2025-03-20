import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/tags/$tagId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { roleId } = Route.useParams()
  console.log(roleId)
  return <div>edit</div>
}
