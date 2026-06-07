/**
 * Thin fetch wrapper that injects the JWT, parses errors, and produces typed responses.
 */

const ENV_API_URL = import.meta.env.VITE_API_URL as string | undefined;
const FALLBACK_API_URL = "http://localhost:8000";

const STORAGE_KEY = "sibi.token";

export interface ApiError extends Error {
  status?: number;
  detail?: string;
}

function baseUrl(): string {
  const url = ENV_API_URL && ENV_API_URL.trim() !== "" ? ENV_API_URL : FALLBACK_API_URL;
  return url.replace(/\/$/, "");
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token === null) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, token);
    }
  } catch {
    /* storage unavailable - ignore */
  }
}

interface RequestOpts {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  auth?: boolean;
}

export async function apiRequest<T>(path: string, opts: RequestOpts = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  if (opts.auth !== false) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${baseUrl()}${path}`, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const payload = (await res.json()) as { detail?: string };
      if (payload.detail) detail = payload.detail;
    } catch {
      /* non-JSON body - ignore */
    }
    const error: ApiError = Object.assign(new Error(detail), {
      status: res.status,
      detail,
    });
    throw error;
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
