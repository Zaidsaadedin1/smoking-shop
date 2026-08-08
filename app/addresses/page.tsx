import { AddressesScreen } from '@/components/customer/screens/CatalogScreens';
import { getAddresses } from '@/lib/storefront-server';

export default async function AddressesPage() {
  const addresses = await getAddresses();

  return <AddressesScreen addresses={addresses} />;
}
