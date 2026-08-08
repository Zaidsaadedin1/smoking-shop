import { notFound } from 'next/navigation';
import { ProductPageView } from '@/components/storefront/storefront-pages';
import { getProductBySlug, getProducts } from '@/lib/commerce-server';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const products = await getProducts();
  const product = await getProductBySlug(id);

  if (!product) {
    notFound();
  }

  return <ProductPageView product={product} relatedProducts={products.filter((item) => item.id !== product.id).slice(0, 4)} />;
}
