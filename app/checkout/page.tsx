import { CheckoutPageView } from '@/components/storefront/storefront-pages';
import { listActiveDeliveryZones, listAddresses } from '@/lib/api/store-api';
import { getCustomerAuthHeaders, getCustomerSession } from '@/lib/customer/auth';

export default async function CheckoutPage() {
  const session = await getCustomerSession();
  const authHeaders = session ? await getCustomerAuthHeaders() : undefined;
  const [addresses, deliveryZones] = await Promise.all([
    session
      ? listAddresses(session.id, authHeaders ? { headers: authHeaders } : undefined)
      : Promise.resolve([]),
    listActiveDeliveryZones(),
  ]);

  return (
    <CheckoutPageView
      session={
        session
          ? {
              fullName: session.fullName,
              email: session.email,
              phone: session.phone ?? '',
            }
          : null
      }
      addresses={(addresses ?? []).map((address) => ({
        id: address.id,
        label: address.label ?? 'Address',
        fullName: address.full_name,
        phone: address.phone,
        country: address.country,
        city: address.city,
        area: address.area ?? '',
        street: address.street ?? '',
        building: address.building ?? '',
        isDefault: address.is_default,
      }))}
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
