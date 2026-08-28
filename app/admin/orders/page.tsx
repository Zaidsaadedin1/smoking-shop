import { AdminOrdersScreen } from '@/components/customer/screens/AdminScreens';
import { requireAdminSession } from '@/lib/admin/auth';
import { getAdminEnumLabels, getAdminOrders, getAdminProducts } from '@/lib/admin/data';

export default async function AdminOrdersPage() {
  const session = await requireAdminSession();
  const [orders, enumLabels, products] = await Promise.all([
    getAdminOrders(),
    getAdminEnumLabels(),
    getAdminProducts(),
  ]);

  return (
    <AdminOrdersScreen
      session={session}
      orders={orders}
      enumLabels={enumLabels}
      products={products}
    />
  );
}
