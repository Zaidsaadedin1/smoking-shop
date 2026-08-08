import { AdminProductsScreen } from '@/components/customer/screens/AdminScreens';
import { requireAdminSession } from '@/lib/admin/auth';
import {
  getAdminBrands,
  getAdminCategories,
  getAdminColors,
  getAdminEnumLabels,
  getAdminProducts,
  getAdminProductVariants,
  getAdminSizes,
} from '@/lib/admin/data';

export default async function AdminProductsPage() {
  const session = await requireAdminSession();
  const [products, categories, brands, sizes, colors, variants, enumLabels] = await Promise.all([
    getAdminProducts(),
    getAdminCategories(),
    getAdminBrands(),
    getAdminSizes(),
    getAdminColors(),
    getAdminProductVariants(),
    getAdminEnumLabels(),
  ]);

  return (
    <AdminProductsScreen
      session={session}
      products={products}
      categories={categories}
      brands={brands}
      sizes={sizes}
      colors={colors}
      variants={variants}
      enumLabels={enumLabels}
    />
  );
}
