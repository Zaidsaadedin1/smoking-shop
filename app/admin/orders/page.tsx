import { AdminOrdersScreen } from '@/components/customer/screens/AdminScreens';
import { requireAdminSession } from '@/lib/admin/auth';
import { getAdminEnumLabels, getAdminOrders } from '@/lib/admin/data';

export default async function AdminOrdersPage() {
  const session = await requireAdminSession();
  const [orders, enumLabels] = await Promise.all([getAdminOrders(), getAdminEnumLabels()]);

  return <AdminOrdersScreen session={session} orders={orders} enumLabels={enumLabels} />;
}
