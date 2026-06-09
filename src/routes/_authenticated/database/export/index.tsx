import { createFileRoute, redirect } from '@tanstack/react-router'
import DatabaseExport from '@/features/database/export'
import { getRoleFromToken } from '@/utils/jwt.util'
import { canAccessUserDirectoryAndDatabaseExport } from '@/utils/role-check.util'

export const Route = createFileRoute('/_authenticated/database/export/')({
  beforeLoad: () => {
    const role = getRoleFromToken()
    if (!canAccessUserDirectoryAndDatabaseExport(role)) {
      throw redirect({
        to: '/',
      })
    }
  },
  component: DatabaseExport,
})
