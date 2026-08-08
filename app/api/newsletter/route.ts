import { insertSupabaseRow } from '@/lib/supabase/rest';
import { jsonError, jsonOk, requireString } from '@/lib/api/http';

type NewsletterSubscriberRow = {
  id: string;
  email: string;
  source: string | null;
  locale: string | null;
  created_at: string;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const email = requireString(body.email, 'email').toLowerCase();

    if (!isValidEmail(email)) {
      return jsonError('Enter a valid email');
    }

    const result = await insertSupabaseRow<NewsletterSubscriberRow>(
      'newsletter_subscribers',
      {
        email,
        source: typeof body.source === 'string' ? body.source : 'storefront',
        locale: typeof body.locale === 'string' ? body.locale : null,
      },
      true
    );

    if (result.error) {
      const normalized = result.error.toLowerCase();

      if (
        normalized.includes('duplicate key') ||
        normalized.includes('already exists') ||
        normalized.includes('unique')
      ) {
        return jsonError('This email is already subscribed.', 409);
      }

      if (normalized.includes('newsletter_subscribers')) {
        return jsonError('Newsletter storage is not configured yet.', 500);
      }

      return jsonError(result.error, result.status);
    }

    return jsonOk(result.data, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Invalid request body');
  }
}
