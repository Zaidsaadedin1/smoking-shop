import { AddressesPageView } from '@/components/storefront/storefront-account-pages';
import { listAddresses } from '@/lib/api/store-api';
import { getCustomerAuthHeaders, requireCustomerSession } from '@/lib/customer/auth';

export default async function AddressesPage() {
  const session = await requireCustomerSession();
  const authHeaders = await getCustomerAuthHeaders();
  const addresses = await listAddresses(session.id, authHeaders ? { headers: authHeaders } : undefined);

  return (
    <AddressesPageView
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
