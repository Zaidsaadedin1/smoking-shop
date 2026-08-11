import { CreateAddressPageView } from '@/components/storefront/storefront-account-pages';
import { listActiveDeliveryZones } from '@/lib/api/store-api';
import { requireCustomerSession } from '@/lib/customer/auth';

export default async function NewAddressPage() {
  await requireCustomerSession();
  const deliveryZones = await listActiveDeliveryZones();

  return (
    <CreateAddressPageView
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
