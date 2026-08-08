type QueryValue = string | number | boolean;

type RestOptions = {
  query?: Record<string, QueryValue | QueryValue[] | undefined>;
  revalidate?: number;
};

function getSupabaseConfig() {
  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!projectUrl || !anonKey) {
    return null;
  }

  return {
    restUrl: `${projectUrl.replace(/\/$/, '')}/rest/v1`,
    anonKey,
  };
}

function buildUrl(path: string, query?: RestOptions['query']) {
  const config = getSupabaseConfig();

  if (!config) {
    return null;
  }

  const url = new URL(`${config.restUrl}/${path.replace(/^\//, '')}`);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value === undefined) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((entry) => {
        url.searchParams.append(key, String(entry));
      });
      return;
    }

    url.searchParams.set(key, String(value));
  });

  return url;
}

export async function fetchSupabaseRest<T>(path: string, options: RestOptions = {}): Promise<T | null> {
  const config = getSupabaseConfig();
  const url = buildUrl(path, options.query);

  if (!config || !url) {
    return null;
  }

  try {
    const response = await fetch(url, {
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${config.anonKey}`,
        Accept: 'application/json',
      },
      next: {
        revalidate: options.revalidate ?? 60,
      },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}
