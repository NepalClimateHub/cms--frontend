
import SetupPage from '@/features/setup';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/setup/')({
  component: SetupPage,
});
