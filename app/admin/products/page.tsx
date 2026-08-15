import { AdminProductsScreen } from '@/components/customer/screens/AdminScreens';
import { requireAdminSession } from '@/lib/admin/auth';
import {
  getAdminBrands,
  getAdminCategories,
  getAdminEnumLabels,
  getAdminProductOptionGroupLinks,
  getAdminProductOptionGroups,
  getAdminProductOptionItems,
  getAdminProducts,
  getAdminProductVariants,
  getAdminSizes,
} from '@/lib/admin/data';

export default async function AdminProductsPage() {
  const session = await requireAdminSession();
  const [
    products,
    categories,
    brands,
    sizes,
    variants,
    optionGroups,
    optionItems,
    optionGroupLinks,
    enumLabels,
  ] = await Promise.all([
    getAdminProducts(),
    getAdminCategories(),
    getAdminBrands(),
    getAdminSizes(),
    getAdminProductVariants(),
    getAdminProductOptionGroups(),
    getAdminProductOptionItems(),
    getAdminProductOptionGroupLinks(),
    getAdminEnumLabels(),
  ]);

  return (
    <AdminProductsScreen
      session={session}
      products={products}
      categories={categories}
      brands={brands}
      sizes={sizes}
      variants={variants}
      optionGroups={optionGroups}
      optionItems={optionItems}
      optionGroupLinks={optionGroupLinks}
      enumLabels={enumLabels}
    />
  );
}
