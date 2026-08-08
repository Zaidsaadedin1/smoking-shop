import { redirect } from 'next/navigation';

export default async function EditAddressPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;
  redirect('/addresses');
}
