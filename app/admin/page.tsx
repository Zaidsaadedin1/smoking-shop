import { AdminDashboardScreen } from '@/components/customer/screens/AdminScreens';
import { requireAdminSession } from '@/lib/admin/auth';
import { getAdminDashboardData } from '@/lib/admin/data';

export default async function AdminPage() {
  const session = await requireAdminSession();
  const { categories, products, orders, customers, brands, enumLabels } = await getAdminDashboardData();

  return <AdminDashboardScreen session={session} categories={categories} products={products} orders={orders} customers={customers} brands={brands} enumLabels={enumLabels} />;
}
