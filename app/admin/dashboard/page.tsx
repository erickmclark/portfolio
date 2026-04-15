import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import DashboardClient from './dashboard-client';

export default async function DashboardPage() {
  if (!(await isAuthenticated())) redirect('/admin');
  return <DashboardClient />;
}
