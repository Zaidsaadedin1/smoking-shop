import { AdminSettingsScreen } from '@/components/customer/screens/AdminScreens';
import { requireAdminSession } from '@/lib/admin/auth';
import {
  getAdminBrands,
  getAdminCategories,
  getAdminColors,
  getAdminEnumLabels,
  getAdminFlashSales,
  getAdminSizes,
} from '@/lib/admin/data';

export default async function AdminSettingsPage() {
  const session = await requireAdminSession();
  const [categories, brands, sizes, colors, flashSales, enumLabels] = await Promise.all([
    getAdminCategories(),
    getAdminBrands(),
    getAdminSizes(),
    getAdminColors(),
    getAdminFlashSales(),
    getAdminEnumLabels(),
  ]);

  return (
    <AdminSettingsScreen
      session={session}
      categories={categories}
      brands={brands}
      sizes={sizes}
      colors={colors}
      flashSales={flashSales}
      enumLabels={enumLabels}
    />
  );
}
