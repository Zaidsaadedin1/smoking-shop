import { OrderSuccessPageView } from '@/components/storefront/storefront-pages';

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <OrderSuccessPageView orderId={id} />;
}
