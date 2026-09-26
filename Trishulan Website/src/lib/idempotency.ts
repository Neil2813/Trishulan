import { NextResponse } from 'next/server';

interface IdempotencyRecord {
  userId: string;
  statusCode: number;
  body: any;
  createdAt: number;
}

const idempotencyCache = new Map<string, IdempotencyRecord>();

// Clean up expired idempotency keys older than 24 hours
setInterval(() => {
  const now = Date.now();
  const ttl = 24 * 60 * 60 * 1000;
  for (const [key, record] of idempotencyCache.entries()) {
    if (now - record.createdAt > ttl) {
      idempotencyCache.delete(key);
    }
  }
}, 30 * 60 * 1000);

/**
 * Checks if an Idempotency-Key has already been processed.
 * Returns cached response if hit, or null if key is new/absent.
 */
export function getIdempotentResponse(req: Request, userId: string): { key: string | null; cachedResponse: NextResponse | null } {
  const idempotencyKey = req.headers.get('idempotency-key') || req.headers.get('x-idempotency-key');
  if (!idempotencyKey) {
    return { key: null, cachedResponse: null };
  }

  const cacheKey = `idempotency:${userId}:${idempotencyKey}`;
  const record = idempotencyCache.get(cacheKey);

  if (record) {
    const response = NextResponse.json(record.body, {
      status: record.statusCode,
      headers: {
        'X-Cache': 'HIT (Idempotent)',
        'X-Idempotency-Key': idempotencyKey,
      },
    });
    return { key: idempotencyKey, cachedResponse: response };
  }

  return { key: idempotencyKey, cachedResponse: null };
}

/**
 * Saves an API response payload associated with an Idempotency Key.
 */
export function saveIdempotentResponse(userId: string, idempotencyKey: string | null, statusCode: number, body: any): void {
  if (!idempotencyKey) return;
  const cacheKey = `idempotency:${userId}:${idempotencyKey}`;
  idempotencyCache.set(cacheKey, {
    userId,
    statusCode,
    body,
    createdAt: Date.now(),
  });
}
