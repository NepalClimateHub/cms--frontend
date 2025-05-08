import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/tags/$tagId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { tagId } = Route.useParams()
  console.log(tagId)
  return <div>edit</div>
}
