import { redirect } from 'next/navigation';
import { CheckoutPageView } from '@/components/storefront/storefront-pages';
import { listAddresses } from '@/lib/api/store-api';
import { getCustomerAuthHeaders, getCustomerSession } from '@/lib/customer/auth';

export default async function CheckoutPage() {
  const session = await getCustomerSession();

  if (!session) {
    redirect('/login?next=/checkout');
  }

  const authHeaders = await getCustomerAuthHeaders();
  const addresses = await listAddresses(
    session.id,
    authHeaders ? { headers: authHeaders } : undefined
  );

  return (
    <CheckoutPageView
      session={{
        fullName: session.fullName,
        email: session.email,
        phone: session.phone ?? '',
      }}
      addresses={(addresses ?? []).map((address) => ({
        id: address.id,
        label: address.label ?? 'Address',
        fullName: address.full_name,
        phone: address.phone,
        city: address.city,
        area: address.area ?? '',
        street: address.street ?? '',
        building: address.building ?? '',
        isDefault: address.is_default,
      }))}
    />
  );
}
