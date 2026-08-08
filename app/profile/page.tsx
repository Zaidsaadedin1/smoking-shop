import { ProfilePageView } from '@/components/storefront/storefront-account-pages';
import { requireCustomerSession } from '@/lib/customer/auth';

export default async function ProfilePage() {
  const session = await requireCustomerSession();
  return <ProfilePageView session={session} />;
}
