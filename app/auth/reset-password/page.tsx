'use client';

import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ResetPasswordPage() {
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

    const { error: updateError } = await supabase.auth.updateUser({ password });

    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }

    setMessage('Password updated. You can now sign in with your new password.');
    setPassword('');
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center px-6 py-16 text-center">
      <div className="w-full rounded-[36px] border border-[var(--border)] bg-[var(--card)] p-8 shadow-[0_18px_54px_rgba(24,18,17,0.08)] md:p-10">
        <div className="text-xs tracking-[0.25em] text-[var(--muted)]">ACCOUNT RECOVERY</div>
        <h1 className="mt-3 font-display text-5xl uppercase">Reset password</h1>
        {checkingSession ? (
          <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
            Preparing your secure password reset…
          </p>
        ) : sessionReady ? (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4 text-left">
            <label className="block text-sm font-medium" htmlFor="password">
              New password
            </label>
            <input
              id="password"
              type="password"
              minLength={8}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-[var(--border)] bg-transparent px-4 py-3"
            />
            {error ? <p className="text-sm text-[var(--error)]">{error}</p> : null}
            {message ? <p className="text-sm text-[var(--success)]">{message}</p> : null}
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-full bg-[var(--text)] px-6 py-3 text-sm font-semibold text-[var(--background)] disabled:opacity-60"
            >
              {saving ? 'Updating…' : 'Update password'}
            </button>
          </form>
        ) : (
          <>
            <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
              This reset link is invalid or expired. Request a new one to continue.
            </p>
            <Link
              href="/forgot-password"
              className="mt-8 inline-flex rounded-full bg-[var(--text)] px-6 py-3 text-sm font-semibold text-[var(--background)]"
            >
              Request a new link
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
