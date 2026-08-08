import { redirect } from 'next/navigation';

export default function AuthVerifyCodePage() {
  redirect('/login');
}
