import { Button, Group, PasswordInput, Stack, Text, TextInput } from '@mantine/core';
import Link from 'next/link';
import { CustomerShell } from '@/components/customer/CustomerShell';
import { SurfaceCard } from '@/components/customer/UiPieces';

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
          <TextInput label="Email or phone" placeholder="Enter your email or phone" radius="md" />
          <PasswordInput label="Password" placeholder="Enter your password" radius="md" />
          <Group gap="md">
            <Button radius="xl" variant="gradient" gradient={{ from: '#2f1a46', to: '#8a58ff', deg: 135 }}>
              {cta}
            </Button>
            <Link href="/home" style={{ textDecoration: 'none' }}>
              <Button component="span" radius="xl" variant="default" color="dark">
                Continue as guest
              </Button>
            </Link>
          </Group>
        </Stack>
      </SurfaceCard>
    </CustomerShell>
  );
}

export function LoginScreen() {
  return <AuthScreenFrame title="Login" subtitle="Secure entry for returning customers." cta="Login" />;
}

export function RegisterScreen() {
  return <AuthScreenFrame title="Register" subtitle="Create a customer profile with address and order history." cta="Register" />;
}

export function ForgotPasswordScreen() {
  return (
    <CustomerShell title="Forgot password" subtitle="Start the reset flow with email or phone." badge="Authentication">
      <SurfaceCard>
        <Stack gap="md" maw={520}>
          <TextInput label="Email or phone" placeholder="Enter your email or phone" radius="md" />
          <Button radius="xl" variant="gradient" gradient={{ from: '#2f1a46', to: '#8a58ff', deg: 135 }}>
            Send code
          </Button>
        </Stack>
      </SurfaceCard>
    </CustomerShell>
  );
}

export function VerifyCodeScreen() {
  return (
    <CustomerShell title="Verify code" subtitle="Confirm the reset or account verification code." badge="Authentication">
      <SurfaceCard>
        <Stack gap="md" maw={520}>
          <TextInput label="Verification code" placeholder="000000" radius="md" />
          <PasswordInput label="New password" placeholder="Create a new password" radius="md" />
          <Button radius="xl" variant="gradient" gradient={{ from: '#2f1a46', to: '#8a58ff', deg: 135 }}>
            Confirm
          </Button>
        </Stack>
      </SurfaceCard>
    </CustomerShell>
  );
}
