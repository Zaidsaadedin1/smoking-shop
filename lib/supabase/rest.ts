type QueryValue = string | number | boolean;
type RestMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

type RestOptions = {
  query?: Record<string, QueryValue | QueryValue[] | undefined>;
  revalidate?: number;
};

type RestRequestOptions = RestOptions & {
  body?: unknown;
  headers?: Record<string, string>;
  method?: RestMethod;
  prefer?: string[];
  single?: boolean;
};

function getSupabaseConfig() {
  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY ?? null;

  if (!projectUrl || !anonKey) {
    return null;
  }

  return {
    restUrl: `${projectUrl.replace(/\/$/, '')}/rest/v1`,
    anonKey,
    serviceRoleKey,
  };
}

export function getSupabaseServiceRoleHeaders() {
  const config = getSupabaseConfig();

  if (!config?.serviceRoleKey) {
    return null;
  }

  return {
    apikey: config.serviceRoleKey,
    Authorization: `Bearer ${config.serviceRoleKey}`,
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

export async function requestSupabaseRest<T>(
  path: string,
  options: RestRequestOptions = {}
): Promise<{ data: T | null; error: string | null; status: number }> {
  const config = getSupabaseConfig();
  const url = buildUrl(path, options.query);

  if (!config || !url) {
    return { data: null, error: 'Missing Supabase configuration', status: 500 };
  }

  try {
    const headers: Record<string, string> = {
      apikey: config.anonKey,
      Authorization: `Bearer ${config.anonKey}`,
      Accept: options.single ? 'application/vnd.pgrst.object+json' : 'application/json',
      ...options.headers,
    };

    if (options.body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    if (options.prefer && options.prefer.length > 0) {
      headers.Prefer = options.prefer.join(',');
    }

    const response = await fetch(url, {
      method: options.method ?? 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      next: {
        revalidate: options.revalidate ?? 60,
      },
    });

    if (!response.ok) {
      let error = `Supabase request failed with status ${response.status}`;

      try {
        const payload = (await response.json()) as {
          message?: string;
          error?: string;
          details?: string;
        };
        error = payload.message ?? payload.error ?? payload.details ?? error;
      } catch {
        // Keep generic message when Supabase does not return JSON.
      }

      return { data: null, error, status: response.status };
    }

    if (response.status === 204) {
      return { data: null, error: null, status: response.status };
    }

    return { data: (await response.json()) as T, error: null, status: response.status };
  } catch {
    return { data: null, error: 'Network error while contacting Supabase', status: 500 };
  }
}

export async function fetchSupabaseRest<T>(
  path: string,
  options: RestRequestOptions = {}
): Promise<T | null> {
  const result = await requestSupabaseRest<T>(path, options);
  return result.data;
}

export async function insertSupabaseRow<T>(
  path: string,
  body: unknown,
  single = false,
  extra?: { headers?: Record<string, string> }
) {
  return requestSupabaseRest<T>(path, {
    method: 'POST',
    body,
    prefer: ['return=representation'],
    single,
    headers: extra?.headers,
  });
}

export async function updateSupabaseRow<T>(
  path: string,
  body: unknown,
  query: RestOptions['query'],
  single = false,
  extra?: { headers?: Record<string, string> }
) {
  return requestSupabaseRest<T>(path, {
    method: 'PATCH',
    body,
    query,
    prefer: ['return=representation'],
    single,
    headers: extra?.headers,
  });
}

export async function deleteSupabaseRow<T>(
  path: string,
  query: RestOptions['query'],
  single = false,
  extra?: { headers?: Record<string, string> }
) {
  return requestSupabaseRest<T>(path, {
    method: 'DELETE',
    query,
    prefer: ['return=representation'],
    single,
    headers: extra?.headers,
  });
}

export async function upsertSupabaseRow<T>(
  path: string,
  body: unknown,
  resolution: string,
  extra?: { headers?: Record<string, string>; single?: boolean }
) {
  return requestSupabaseRest<T>(path, {
    method: 'POST',
    body,
    prefer: ['return=representation', `resolution=${resolution}`],
    single: extra?.single,
    headers: extra?.headers,
  });
}

export async function fetchSupabaseSingle<T>(
  path: string,
  query: RestOptions['query'],
  extra?: { headers?: Record<string, string>; revalidate?: number }
) {
  return requestSupabaseRest<T>(path, {
    query,
    single: true,
    headers: extra?.headers,
    revalidate: extra?.revalidate,
  });
}

export async function invokeSupabaseAuth<T>(
  path: string,
  body: unknown,
  query?: Record<string, string | number | boolean | undefined>
): Promise<{ data: T | null; error: string | null; status: number }> {
  const config = getSupabaseConfig();

  if (!config) {
    return { data: null, error: 'Missing Supabase configuration', status: 500 };
  }

  try {
    const response = await fetch(
      (() => {
        const url = new URL(
          `${config.restUrl.replace('/rest/v1', '')}/auth/v1/${path.replace(/^\//, '')}`
        );
        Object.entries(query ?? {}).forEach(([key, value]) => {
          if (value !== undefined) url.searchParams.set(key, String(value));
        });
        return url;
      })(),
      {
        method: 'POST',
        headers: {
          apikey: config.anonKey,
          Authorization: `Bearer ${config.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      let error = `Supabase auth request failed with status ${response.status}`;

      try {
        const payload = (await response.json()) as {
          msg?: string;
          error_description?: string;
          error?: string;
        };
        error = payload.msg ?? payload.error_description ?? payload.error ?? error;
      } catch {
        // Ignore parse failures.
      }

      return { data: null, error, status: response.status };
    }

    return { data: (await response.json()) as T, error: null, status: response.status };
  } catch {
    return { data: null, error: 'Network error while contacting Supabase Auth', status: 500 };
  }
}
