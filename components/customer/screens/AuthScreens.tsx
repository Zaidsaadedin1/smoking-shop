import { Group, Stack, TextInput } from '@mantine/core';
import Link from 'next/link';
import { CustomerShell } from '@/components/customer/CustomerShell';
import {
  AuthHeader,
  AuthSubmitButton,
  EmailInput,
  PasswordField,
  PasswordStrength,
  PhoneInput,
  SocialLoginButton,
  SurfaceCard,
} from '@/components/customer/shared/SharedComponents';

function AuthScreenFrame({
  title,
  subtitle,
  cta,
}: {
  title: string;
  subtitle: string;
  cta: string;
}) {
  return (
    <CustomerShell title={title} subtitle={subtitle} badge="Authentication">
      <SurfaceCard>
        <Stack gap="md" maw={520}>
          <AuthHeader title={title} subtitle={subtitle} />
          <EmailInput />
          <PhoneInput />
          <PasswordField />
          {cta === 'Register' ? <PasswordStrength /> : null}
          <Group gap="md">
            <AuthSubmitButton label={cta} />
            <SocialLoginButton label="SocialLoginButton" />
            <Link href="/home" style={{ textDecoration: 'none' }}>
              <SocialLoginButton label="Continue as guest" asSpan />
            </Link>
          </Group>
        </Stack>
      </SurfaceCard>
    </CustomerShell>
  );
}

export function LoginScreen() {
  return <AuthScreenFrame title="LoginScreen" subtitle="Secure entry for returning customers." cta="Login" />;
}

export function RegisterScreen() {
  return <AuthScreenFrame title="RegisterScreen" subtitle="Create a customer profile with address and order history." cta="Register" />;
}

export function ForgotPasswordScreen() {
  return (
    <CustomerShell title="ForgotPasswordScreen" subtitle="Start the reset flow with email or phone." badge="Authentication">
      <SurfaceCard>
        <Stack gap="md" maw={520}>
          <AuthHeader title="ForgotPasswordScreen" subtitle="Request a verification code." />
          <EmailInput />
          <PhoneInput />
          <AuthSubmitButton label="Send code" />
        </Stack>
      </SurfaceCard>
    </CustomerShell>
  );
}

export function VerifyCodeScreen() {
  return (
    <CustomerShell title="VerifyCodeScreen" subtitle="Confirm the reset or account verification code." badge="Authentication">
      <SurfaceCard>
        <Stack gap="md" maw={520}>
          <AuthHeader title="VerifyCodeScreen" subtitle="Confirm code and set password." />
          <TextInput label="Verification code" placeholder="000000" radius="md" />
          <PasswordField />
          <PasswordStrength value={84} />
          <AuthSubmitButton label="Confirm" />
        </Stack>
      </SurfaceCard>
    </CustomerShell>
  );
}
