import { redirect } from 'next/navigation';
import { AuthPageView } from '@/components/storefront/storefront-account-pages';
import { getCustomerSession } from '@/lib/customer/auth';

export default async function RegisterPage() {
  const session = await getCustomerSession();

  if (session) {
    redirect('/account');
  }

  return <AuthPageView mode="register" />;
}
