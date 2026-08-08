import { redirect } from 'next/navigation';
import { AdminLoginScreen } from '@/components/customer/screens/AdminScreens';
import { getAdminSession } from '@/lib/admin/auth';

export default async function AdminLoginPage() {
  const session = await getAdminSession();

  if (session) {
    redirect('/admin');
  }

  return <AdminLoginScreen />;
}
