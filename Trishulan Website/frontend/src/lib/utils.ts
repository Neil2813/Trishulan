import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function safeJsonFetch<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<{ ok: boolean; status: number; data: T | null; error?: string }> {
  try {
    const res = await fetch(input, init);
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await res.text();
      return {
        ok: res.ok,
        status: res.status,
        data: null,
        error: text || `HTTP ${res.status}`,
      };
    }
    const data = await res.json();
    return {
      ok: res.ok,
      status: res.status,
      data,
      error: res.ok ? undefined : (data?.error || `HTTP ${res.status}`),
    };
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: err?.message || "Network error",
    };
  }
}

