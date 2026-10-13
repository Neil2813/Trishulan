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
      return {
        ok: res.ok,
        status: res.status,
        data: null,
        error: res.status >= 500
          ? "The service is temporarily unavailable. Please try again later."
          : `Request failed (HTTP ${res.status}).`,
      };
    }
    const data = await res.json();
    return {
      ok: res.ok,
      status: res.status,
      data,
      error: res.ok
        ? undefined
        : res.status >= 500
          ? "The service is temporarily unavailable. Please try again later."
          : (data?.error || `Request failed (HTTP ${res.status}).`),
    };
  } catch {
    return {
      ok: false,
      status: 0,
      data: null,
      error: "Unable to connect to the service. Check your connection and try again.",
    };
  }
}
