import { CheckoutAddressScreen } from '@/components/customer/screens/CheckoutScreens';
import { getAddresses } from '@/lib/storefront-server';

export default async function CheckoutAddressPage() {
  const addresses = await getAddresses();

  return <CheckoutAddressScreen addresses={addresses} />;
}
