import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/profile')({
  beforeLoad: () => {
    throw redirect({
      to: '/dashboard/profile',
      replace: true,
    })
  },
  component: () => null,
})
