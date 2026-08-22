import { AdminProductsScreen } from '@/components/customer/screens/AdminScreens';
import { requireAdminSession } from '@/lib/admin/auth';
import {
  getAdminBrands,
  getAdminCategories,
  getAdminEnumLabels,
  getAdminProductOptionGroupLinks,
  getAdminProductOptionGroups,
  getAdminProductOptionItems,
  getAdminProductOptionItemLinks,
  getAdminProducts,
  getAdminProductVariants,
} from '@/lib/admin/data';

export default async function AdminProductsPage() {
  const session = await requireAdminSession();
  const [
    products,
    categories,
    brands,
    variants,
    optionGroups,
    optionItems,
    optionGroupLinks,
    optionItemLinks,
    enumLabels,
  ] = await Promise.all([
    getAdminProducts(),
    getAdminCategories(),
    getAdminBrands(),
    getAdminProductVariants(),
    getAdminProductOptionGroups(),
    getAdminProductOptionItems(),
    getAdminProductOptionGroupLinks(),
    getAdminProductOptionItemLinks(),
    getAdminEnumLabels(),
  ]);

  return (
    <AdminProductsScreen
      session={session}
      products={products}
      categories={categories}
      brands={brands}
      variants={variants}
      optionGroups={optionGroups}
      optionItems={optionItems}
      optionGroupLinks={optionGroupLinks}
      optionItemLinks={optionItemLinks}
      enumLabels={enumLabels}
    />
  );
}
