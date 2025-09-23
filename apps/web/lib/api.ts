import { API_URL } from './env';
import { ApiResponse } from './types';

export async function fetchJSON<T = any>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.headers || {}),
    },
    cache: init?.cache,
    next: (init as any)?.next,
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed: ${res.status}`);
  }
  
  const data = await res.json();
  return data.success ? data.data : data;
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers || {});
  const hasBody = init && 'body' in init && init.body != null;

  if (
    hasBody &&
    !(init!.body instanceof FormData) &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  });
}

export async function apiRequest<T = any>(path: string, init?: RequestInit): Promise<T> {
  const res = await apiFetch(path, init);
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed: ${res.status}`);
  }
  
  const data: ApiResponse<T> = await res.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Request failed');
  }
  
  return data.data as T;
}

export const fetcher = (url: string) =>
  fetch(url, { credentials: 'include' }).then(async (r) => {
    if (!r.ok) {
      const errorData = await r.json().catch(() => ({}));
      throw new Error(errorData.error || `Request failed: ${r.status}`);
    }
    return r.json();
  });