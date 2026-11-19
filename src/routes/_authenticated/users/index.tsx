import { createFileRoute, redirect } from '@tanstack/react-router'
import Users from '@/features/users'
import { getRoleFromToken } from '@/utils/jwt.util'
import { canAccessUserDirectoryAndDatabaseExport } from '@/utils/role-check.util'

export const Route = createFileRoute('/_authenticated/users/')({
  beforeLoad: () => {
    const role = getRoleFromToken()
    if (!canAccessUserDirectoryAndDatabaseExport(role)) {
      throw redirect({
        to: '/',
      })
    }
  },
  validateSearch: (search: Record<string, unknown>): { role?: string } => {
    return {
      role: (search.role as string) || undefined,
    }
  },
  component: Users,
})
