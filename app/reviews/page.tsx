import { ReviewsPageView } from '@/components/storefront/storefront-account-pages';
import { requireCustomerSession } from '@/lib/customer/auth';

export default async function ReviewsPage() {
  await requireCustomerSession();
  return <ReviewsPageView reviews={[]} />;
}
