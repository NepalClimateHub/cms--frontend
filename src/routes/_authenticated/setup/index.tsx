import { createFileRoute, redirect } from '@tanstack/react-router';
import SetupPage from '@/features/setup';
import { getRoleFromToken } from '@/utils/jwt.util'
import { isAdminLevel } from '@/utils/role-check.util';

export const Route = createFileRoute('/_authenticated/setup/')({
  beforeLoad: () => {
    const role = getRoleFromToken()
    if (!isAdminLevel(role)) {
      throw redirect({
        to: '/',
      })
    }
  },
  component: SetupPage,
});
