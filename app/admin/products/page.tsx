import { AdminProductsScreen } from '@/components/customer/screens/AdminScreens';
import { requireAdminSession } from '@/lib/admin/auth';
import { getAdminBrands, getAdminCategories, getAdminEnumLabels, getAdminProducts } from '@/lib/admin/data';

export default async function AdminProductsPage() {
  const session = await requireAdminSession();
  const [products, categories, brands, enumLabels] = await Promise.all([
    getAdminProducts(),
    getAdminCategories(),
    getAdminBrands(),
    getAdminEnumLabels(),
  ]);

  return <AdminProductsScreen session={session} products={products} categories={categories} brands={brands} enumLabels={enumLabels} />;
}
