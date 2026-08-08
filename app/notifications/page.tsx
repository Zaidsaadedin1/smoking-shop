import { NotificationsPageView } from '@/components/storefront/storefront-account-pages';
import { requireCustomerSession } from '@/lib/customer/auth';

export default async function NotificationsPage() {
  await requireCustomerSession();
  return <NotificationsPageView />;
}
