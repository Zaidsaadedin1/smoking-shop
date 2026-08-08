import { notFound } from 'next/navigation';
import { ShopPageView } from '@/components/storefront/storefront-pages';
import { getStorefrontData } from '@/lib/commerce-server';

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { categories, products, flashSale } = await getStorefrontData({ category: id });
  const category = categories.find((item) => item.slug === id);

  if (!category) {
    notFound();
  }

  return (
    <ShopPageView
      products={products}
      categories={categories}
      title={category.name}
      description={category.description}
      initialCategory={category.slug}
      flashSale={flashSale}
    />
  );
}
