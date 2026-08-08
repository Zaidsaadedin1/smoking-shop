import { SettingsPageView } from '@/components/storefront/storefront-account-pages';
import { requireCustomerSession } from '@/lib/customer/auth';

export default async function SettingsPage() {
  const session = await requireCustomerSession();
  return <SettingsPageView session={session} />;
}
