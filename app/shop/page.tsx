import { ShopPageView } from '@/components/storefront/storefront-pages';
import { getStorefrontData } from '@/lib/commerce-server';

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const category = typeof params.category === 'string' ? params.category : undefined;
  const sort = typeof params.sort === 'string' ? params.sort : undefined;
  const sale = params.sale === 'true' ? true : undefined;
  const { products, categories, flashSale } = await getStorefrontData();

  return (
    <ShopPageView
      products={products}
      categories={categories}
      flashSale={flashSale}
      initialCategory={category}
      initialSort={sort === 'price-asc' || sort === 'price-desc' || sort === 'featured' || sort === 'newest' ? sort : undefined}
      initialSale={sale}
    />
  );
}
