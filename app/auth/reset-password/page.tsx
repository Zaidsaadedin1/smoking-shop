'use client';

import { Alert, Box, Button, Center, Loader, Paper, Stack, Text, Title } from '@mantine/core';

import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { useLocale } from '@/components/storefront/locale-provider';
import { StorePasswordInput } from '@/components/storefront/ui/store-form-controls';
import { StorePageContainer } from '@/components/storefront/ui/store-layout';
import { translateAuthError } from '@/lib/i18n';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ResetPasswordPage() {
  const router = useRouter();
  const { locale, t } = useLocale();
  const [password, setPassword] = useState('');
  const [sessionReady, setSessionReady] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    const finishSessionCheck = (hasSession: boolean) => {
      if (!active) {
        return;
      }
      setSessionReady(hasSession);
      setCheckingSession(false);
    };

    const initializeRecoverySession = async () => {
      const code = new URLSearchParams(window.location.search).get('code');

      if (code) {
        const { data } = await supabase.auth.exchangeCodeForSession(code);
        finishSessionCheck(Boolean(data.session));
        return;
      }

      const { data } = await supabase.auth.getSession();
      finishSessionCheck(Boolean(data.session));
    };

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      finishSessionCheck(Boolean(session));
    });

    void initializeRecoverySession();

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setSaving(true);

    const { data, error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setSaving(false);
      setError(translateAuthError(updateError.message, locale));
      return;
    }

    const email = data.user?.email ?? (await supabase.auth.getUser()).data.user?.email;
    if (!email) {
      setSaving(false);
      setError(t('Password updated, but we could not open your profile. Please sign in.'));
      return;
    }

    let loginResponse: Response;
    try {
      loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: email, password }),
      });
    } catch {
      setSaving(false);
      setError(t('Password updated, but we could not open your profile. Please sign in.'));
      return;
    }
    const loginPayload = (await loginResponse.json().catch(() => ({}))) as { error?: string };

    setSaving(false);
    if (!loginResponse.ok) {
      setError(
        loginPayload.error
          ? translateAuthError(loginPayload.error, locale)
          : t('Password updated, but we could not open your profile. Please sign in.')
      );
      return;
    }

    setPassword('');
    router.replace('/profile');
    router.refresh();
  }

  return (
    <StorePageContainer size="xs" py={{ base: 48, sm: 64 }}>
      <Paper radius={32} p={{ base: 24, sm: 40 }} withBorder shadow="lg" ta="center" w="100%">
        <Text size="xs" c="dimmed" tt="uppercase" lts="0.25em">
          {t('ACCOUNT RECOVERY')}
        </Text>
        <Title order={1} mt={12} fz={{ base: 38, sm: 50 }} tt="uppercase">
          {t('Reset password')}
        </Title>
        {checkingSession ? (
          <Center mt="xl">
            <Loader size="sm" aria-label={t('Preparing your secure password reset…')} />
          </Center>
        ) : sessionReady ? (
          <Box component="form" onSubmit={handleSubmit} mt={32} ta="start">
            <Stack gap="md">
              <StorePasswordInput
                id="password"
                label={t('New password')}
                minLength={8}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              {error ? (
                <Alert color="red" radius="md">
                  {error}
                </Alert>
              ) : null}
              {message ? (
                <Alert color="green" radius="md">
                  {message}
                </Alert>
              ) : null}
              <Button type="submit" loading={saving} fullWidth size="md" radius="xl" color="dark">
                {saving ? t('Updating…') : t('Update password')}
              </Button>
            </Stack>
          </Box>
        ) : (
          <Stack mt="md" gap="xl">
            <Text size="sm" c="dimmed" lh={1.8}>
              {t('This reset link is invalid or expired. Request a new one to continue.')}
            </Text>
            <Button component={Link} href="/forgot-password" radius="xl" color="dark">
              {t('Request a new link')}
            </Button>
          </Stack>
        )}
      </Paper>
    </StorePageContainer>
  );
}
