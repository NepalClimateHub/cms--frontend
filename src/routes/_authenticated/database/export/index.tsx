import { createFileRoute, redirect } from '@tanstack/react-router'
import DatabaseExport from '@/features/database/export'
import { getRoleFromToken } from '@/utils/jwt.util.tsx'

export const Route = createFileRoute('/_authenticated/database/export/')({
  beforeLoad: () => {
    const role = getRoleFromToken()
    if (role !== 'ADMIN') {
      throw redirect({
        to: '/',
      })
    }
  },
  component: DatabaseExport,
})
