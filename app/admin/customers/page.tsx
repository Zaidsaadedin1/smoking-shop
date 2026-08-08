import { AdminCustomersScreen } from '@/components/customer/screens/AdminScreens';
import { requireAdminSession } from '@/lib/admin/auth';
import { getAdminCustomers, getAdminEnumLabels } from '@/lib/admin/data';

export default async function AdminCustomersPage() {
  const session = await requireAdminSession();
  const [customers, enumLabels] = await Promise.all([getAdminCustomers(), getAdminEnumLabels()]);

  return <AdminCustomersScreen session={session} customers={customers} enumLabels={enumLabels} />;
}
