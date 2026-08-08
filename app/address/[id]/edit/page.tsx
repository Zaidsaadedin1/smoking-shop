import { EditAddressScreen } from '@/components/customer/screens/OrderAndProfileScreens';

export default async function EditAddressPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <EditAddressScreen id={id} />;
}
