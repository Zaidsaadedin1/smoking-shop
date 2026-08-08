import { CreateAddressPageView } from '@/components/storefront/storefront-account-pages';
import { requireCustomerSession } from '@/lib/customer/auth';

export default async function NewAddressPage() {
  await requireCustomerSession();
  return <CreateAddressPageView />;
}
