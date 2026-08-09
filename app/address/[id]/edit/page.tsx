import { redirect } from 'next/navigation';
import { CreateAddressPageView } from '@/components/storefront/storefront-account-pages';
import { listAddresses } from '@/lib/api/store-api';
import { getCustomerAuthHeaders, requireCustomerSession } from '@/lib/customer/auth';

export default async function EditAddressPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireCustomerSession();
  const authHeaders = await getCustomerAuthHeaders();
  const addresses = await listAddresses(
    session.id,
    authHeaders ? { headers: authHeaders } : undefined
  );
  const { id } = await params;
  const address = (addresses ?? []).find((item) => item.id === id);

  if (!address) {
    redirect('/addresses');
  }

  return (
    <CreateAddressPageView
      addressId={address.id}
      initialAddress={{
        label: address.label ?? 'Address',
        fullName: address.full_name,
        phone: address.phone,
        city: address.city,
        area: address.area ?? '',
        street: address.street ?? '',
        building: address.building ?? '',
        isDefault: address.is_default,
      }}
    />
  );
}
