import { ProfilePageView } from '@/components/storefront/storefront-account-pages';
import { listAddresses } from '@/lib/api/store-api';
import { getCustomerAuthHeaders, requireCustomerSession } from '@/lib/customer/auth';

export default async function ProfilePage() {
  const session = await requireCustomerSession();
  const authHeaders = await getCustomerAuthHeaders();
  const addresses = await listAddresses(
    session.id,
    authHeaders ? { headers: authHeaders } : undefined
  );
  const fallbackPhone = session.phone || addresses?.[0]?.phone || null;

  return <ProfilePageView session={{ ...session, phone: fallbackPhone }} />;
}
