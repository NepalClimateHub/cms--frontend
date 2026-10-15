import { createFileRoute, redirect } from '@tanstack/react-router'
import AiDocumentManagement from '@/features/ask-ai/document-management'
import { getRoleFromToken } from '@/utils/jwt.util'
import { canAccessUserDirectoryAndDatabaseExport } from '@/utils/role-check.util'

export const Route = createFileRoute('/_authenticated/ai-documents/')({
  beforeLoad: () => {
    if (!canAccessUserDirectoryAndDatabaseExport(getRoleFromToken())) {
      throw redirect({ to: '/' })
    }
  },
  component: AiDocumentManagement,
})
