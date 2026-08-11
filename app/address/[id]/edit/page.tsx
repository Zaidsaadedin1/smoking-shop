import { redirect } from 'next/navigation';
import { CreateAddressPageView } from '@/components/storefront/storefront-account-pages';
import { listActiveDeliveryZones, listAddresses } from '@/lib/api/store-api';
import { getCustomerAuthHeaders, requireCustomerSession } from '@/lib/customer/auth';

export default async function EditAddressPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireCustomerSession();
  const authHeaders = await getCustomerAuthHeaders();
  const [addresses, deliveryZones] = await Promise.all([
    listAddresses(session.id, authHeaders ? { headers: authHeaders } : undefined),
    listActiveDeliveryZones(),
  ]);
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
        country: address.country,
        city: address.city,
        area: address.area ?? '',
        street: address.street ?? '',
        building: address.building ?? '',
        isDefault: address.is_default,
      }}
      deliveryZones={(deliveryZones ?? []).map((zone) => ({
        id: zone.id,
        country: zone.country,
        countryAr: zone.country_ar ?? '',
        city: zone.city ?? '',
        cityAr: zone.city_ar ?? '',
        fee: Number(zone.fee),
        sortOrder: Number(zone.sort_order ?? 0),
        isActive: zone.is_active ?? true,
      }))}
    />
  );
}
