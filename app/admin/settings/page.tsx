import { AdminSettingsScreen } from '@/components/customer/screens/AdminScreens';
import { requireAdminSession } from '@/lib/admin/auth';
import {
  getAdminBrands,
  getAdminCategories,
  getAdminCoupons,
  getAdminColors,
  getAdminDeliveryZones,
  getAdminEnumLabels,
  getAdminFlashSales,
  getAdminHeroSlides,
  getAdminNavigationItems,
  getAdminSizes,
} from '@/lib/admin/data';

export default async function AdminSettingsPage() {
  const session = await requireAdminSession();
  const [
    categories,
    brands,
    sizes,
    colors,
    coupons,
    flashSales,
    heroSlides,
    navigationItems,
    deliveryZones,
    enumLabels,
  ] = await Promise.all([
    getAdminCategories(),
    getAdminBrands(),
    getAdminSizes(),
    getAdminColors(),
    getAdminCoupons(),
    getAdminFlashSales(),
    getAdminHeroSlides(),
    getAdminNavigationItems(),
    getAdminDeliveryZones(),
    getAdminEnumLabels(),
  ]);

  return (
    <AdminSettingsScreen
      session={session}
      categories={categories}
      brands={brands}
      sizes={sizes}
      colors={colors}
      coupons={coupons}
      flashSales={flashSales}
      heroSlides={heroSlides}
      navigationItems={navigationItems}
      deliveryZones={deliveryZones}
      enumLabels={enumLabels}
    />
  );
}
