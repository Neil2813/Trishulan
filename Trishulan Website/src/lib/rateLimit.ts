import { NextResponse } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Enforces rate limiting per IP address or client key.
 * @param req Request object
 * @param limit Max requests allowed within window
 * @param windowMs Window duration in milliseconds (e.g., 60,000 for 1 min)
 */
export function checkRateLimit(
  req: Request,
  limit: number = 5,
  windowMs: number = 60 * 1000
): { success: boolean; limit: number; remaining: number; resetInSec: number; response?: NextResponse } {
  // Extract client IP address from headers
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : realIp || '127.0.0.1';

  const url = new URL(req.url);
  const key = `ratelimit:${url.pathname}:${clientIp}`;

  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    // Initial request or expired window
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });

    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetInSec: Math.ceil(windowMs / 1000),
    };
  }

  if (record.count >= limit) {
    const resetInSec = Math.ceil((record.resetAt - now) / 1000);
    const response = NextResponse.json(
      {
        error: 'Too many requests. Rate limit exceeded. Please try again later.',
        retryAfterSeconds: resetInSec,
      },
      {
        status: 429,
        headers: {
          'Retry-After': resetInSec.toString(),
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.ceil(record.resetAt / 1000).toString(),
        },
      }
    );

    return {
      success: false,
      limit,
      remaining: 0,
      resetInSec,
      response,
    };
  }

  record.count += 1;
  const remaining = limit - record.count;
  const resetInSec = Math.ceil((record.resetAt - now) / 1000);

  return {
    success: true,
    limit,
    remaining,
    resetInSec,
  };
}
