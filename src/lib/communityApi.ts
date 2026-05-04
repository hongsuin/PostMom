import { getSupabaseBrowserClient } from './supabase';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

type RequestMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

async function getAuthHeader(required = true) {
  const supabase = getSupabaseBrowserClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;
  if (!token && required) {
    throw new Error('로그인이 필요합니다.');
  }

  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function communityRequest<T>(
  path: string,
  options: { method?: RequestMethod; body?: unknown; auth?: boolean } = {},
): Promise<T> {
  const { method = 'GET', body, auth = false } = options;
  const authHeader = await getAuthHeader(auth);
  const headers = new Headers({ 'Content-Type': 'application/json' });
  const token = authHeader.Authorization;
  if (token) {
    headers.set('Authorization', token);
  }

  const res = await fetch(`${SERVER_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let message = '요청 처리 중 오류가 발생했습니다.';
    try {
      const errorBody = (await res.json()) as {
        error?: { message?: string };
      };
      message = errorBody.error?.message ?? message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}
