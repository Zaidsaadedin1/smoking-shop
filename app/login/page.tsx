import { redirect } from 'next/navigation';
import { AuthPageView } from '@/components/storefront/storefront-account-pages';
import { getCustomerSession } from '@/lib/customer/auth';

function getSafeNextPath(value: string | string[] | undefined) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) {
    return '/account';
  }

  return value;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const session = await getCustomerSession();
  const { next } = await searchParams;
  const nextPath = getSafeNextPath(next);

  if (session) {
    redirect(nextPath);
  }

  return <AuthPageView mode="login" nextPath={nextPath} />;
}
