import { createFileRoute, redirect } from '@tanstack/react-router';
import SetupPage from '@/features/setup';
import { getRoleFromToken } from '@/utils/jwt.util';

export const Route = createFileRoute('/_authenticated/setup/')({
  beforeLoad: () => {
    const role = getRoleFromToken()
    if (role !== 'ADMIN') {
      throw redirect({
        to: '/',
      })
    }
  },
  component: SetupPage,
});
