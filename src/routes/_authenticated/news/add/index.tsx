import { createFileRoute, redirect } from '@tanstack/react-router'
import NewsAdd from '@/features/news/add'
import { getRoleFromToken } from '@/utils/jwt.util'

export const Route = createFileRoute('/_authenticated/news/add/')({
  beforeLoad: () => {
    const role = getRoleFromToken()
    if (role !== 'ADMIN') {
      throw redirect({
        to: '/',
      })
    }
  },
  component: NewsAdd,
})
