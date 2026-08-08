import { CheckoutIndexScreen } from '@/components/customer/screens/CheckoutScreens';
import { getAddresses } from '@/lib/storefront-server';

export default async function CheckoutPage() {
  const addresses = await getAddresses();

  return <CheckoutIndexScreen addresses={addresses} />;
}
