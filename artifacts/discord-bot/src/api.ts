const BASE_URL = 'https://key-management-system--akka92762vgggg.replit.app';

let sessionCookie = '';

function makeHeaders(extra?: Record<string, string>) {
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (sessionCookie) h['Cookie'] = sessionCookie;
  return { ...h, ...extra };
}

export async function login(): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: process.env.API_ADMIN_USERNAME,
      password: process.env.API_ADMIN_PASSWORD,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Connexion API échouée: ${text}`);
  }

  // Extract session cookie from response headers
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) {
    // Extract just the cookie value (before first semicolon)
    sessionCookie = setCookie.split(';')[0];
  }
}

async function apiRequest<T = unknown>(
  method: string,
  path: string,
  body?: object
): Promise<T> {
  const options: RequestInit = {
    method,
    headers: makeHeaders(),
  };
  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  let res = await fetch(`${BASE_URL}${path}`, options);

  // Session expired — re-login once
  if (res.status === 401) {
    await login();
    options.headers = makeHeaders();
    res = await fetch(`${BASE_URL}${path}`, options);
  }

  if (!res.ok) {
    let errMsg = res.statusText;
    try {
      const data = await res.json() as { message?: string; error?: string };
      errMsg = data.message ?? data.error ?? errMsg;
    } catch {}
    throw new Error(errMsg);
  }

  const text = await res.text();
  if (!text) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

// ---------- Account helpers ----------

interface Account {
  id: string;
  username: string;
  banned?: boolean;
  days?: number;
  expiresAt?: string;
  [key: string]: unknown;
}

export async function getAccount(id: string): Promise<Account> {
  return apiRequest<Account>('GET', `/api/accounts/${id}`);
}

export async function findAccount(username: string): Promise<Account | null> {
  const list = await apiRequest<Account[]>(
    'GET',
    `/api/accounts?search=${encodeURIComponent(username)}`
  );
  if (!Array.isArray(list)) return null;
  // Exact match only — never act on the wrong account
  return list.find((a) => a.username === username) ?? null;
}

export async function createAccount(
  username: string,
  password: string,
  days: number
): Promise<Account> {
  return apiRequest<Account>('POST', '/api/accounts', { username, password, days });
}

export async function banAccount(id: string): Promise<unknown> {
  return apiRequest('POST', `/api/accounts/${id}/ban`);
}

export async function unbanAccount(id: string): Promise<unknown> {
  return apiRequest('POST', `/api/accounts/${id}/unban`);
}

export async function resetSessions(id: string): Promise<unknown> {
  return apiRequest('DELETE', `/api/accounts/${id}/sessions`);
}

