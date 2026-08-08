import { notFound } from 'next/navigation';
import { ProductPageView } from '@/components/storefront/storefront-pages';
import { listFavorites, listReviews } from '@/lib/api/store-api';
import { getProductBySlug, getProducts } from '@/lib/commerce-server';
import { getCustomerAuthHeaders, getCustomerSession } from '@/lib/customer/auth';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getCustomerSession();
  const authHeaders = await getCustomerAuthHeaders();
  const products = await getProducts();
  const product = await getProductBySlug(id);

  if (!product) {
    notFound();
  }

  const [favorites, reviews] = await Promise.all([
    session ? listFavorites(session.id, authHeaders ? { headers: authHeaders } : undefined) : Promise.resolve([]),
    listReviews(product.id),
  ]);

  const favoriteIds = new Set((favorites ?? []).map((item) => item.product_id));

  return (
    <ProductPageView
      product={product}
      relatedProducts={products.filter((item) => item.id !== product.id).slice(0, 4)}
      customer={session ? { id: session.id, fullName: session.fullName } : null}
      initialIsFavorite={favoriteIds.has(product.id)}
      initialReviews={(reviews ?? []).map((review) => ({
        id: review.id,
        rating: review.rating,
        title: review.title ?? '',
        comment: review.comment ?? '',
        createdAt: new Intl.DateTimeFormat('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }).format(new Date(review.created_at)),
        authorName: 'Verified customer',
      }))}
    />
  );
}
