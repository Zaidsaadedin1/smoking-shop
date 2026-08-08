import { AdminCustomersScreen } from '@/components/customer/screens/AdminScreens';
import { getCategories } from '@/lib/storefront-server';

export default async function AdminCustomersPage() {
  const categories = await getCategories();

  return <AdminCustomersScreen categories={categories} />;
}
