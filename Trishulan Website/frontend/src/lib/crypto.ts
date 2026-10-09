/**
 * Trishulan E2EE for 1-on-1 DMs.
 *
 * - Each user's browser owns an ECDH P-256 key pair.
 *   The PRIVATE key is generated as non-extractable and lives only in IndexedDB.
 *   Only the PUBLIC key (JWK) is uploaded to the server.
 * - A per-conversation AES-GCM-256 key is derived via ECDH(myPrivate, partnerPublic)
 *   → HKDF-SHA256. Both sides derive the same key; the server never can.
 * - Payload format stored on the server: `[ENC:v1:<iv_b64>:<ciphertext_b64>]`.
 *   The plaintext inside is JSON ({ t: text, a?: attachmentUrl }) so attachments
 *   are encrypted too.
 */

const DB_NAME = 'trishulan-e2ee';
const STORE = 'keys';
const ENC_PREFIX = '[ENC:v1:';

export interface DecryptedBody {
  text: string;
  attachmentUrl?: string;
}

interface StoredKeyPair {
  privateKey: CryptoKey;
  publicJwk: string;
}

// ── IndexedDB helpers ────────────────────────────────────────────────────────
function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet<T>(key: string): Promise<T | undefined> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(key);
    req.onsuccess = () => resolve(req.result as T | undefined);
    req.onerror = () => reject(req.error);
  });
}

async function idbPut(key: string, value: unknown): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ── Encoding helpers ─────────────────────────────────────────────────────────
function toB64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

function fromB64(b64: string): Uint8Array {
  const s = atob(b64);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

/** Canonical JWK string (only public members, fixed order) so server comparisons are stable. */
function canonicalPublicJwk(jwk: JsonWebKey): string {
  return JSON.stringify({ kty: jwk.kty, crv: jwk.crv, x: jwk.x, y: jwk.y });
}

// ── Identity key management ─────────────────────────────────────────────────
export function isE2EESupported(): boolean {
  return typeof window !== 'undefined' && !!window.crypto?.subtle && !!window.indexedDB;
}

/**
 * Returns this browser's key pair for `userId`, creating one on first use.
 * The private key is non-extractable: JS (and XSS) can use it but never read its bytes.
 */
export async function getOrCreateIdentity(userId: string): Promise<StoredKeyPair> {
  const existing = await idbGet<StoredKeyPair>(`identity:${userId}`);
  if (existing?.privateKey && existing.publicJwk) return existing;

  const pair = (await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    false, // private key non-extractable
    ['deriveKey', 'deriveBits'],
  )) as CryptoKeyPair;

  const publicJwk = canonicalPublicJwk(await crypto.subtle.exportKey('jwk', pair.publicKey));
  const stored: StoredKeyPair = { privateKey: pair.privateKey, publicJwk };
  await idbPut(`identity:${userId}`, stored);
  return stored;
}

// ── Conversation key derivation (cached) ─────────────────────────────────────
const convKeyCache = new Map<string, Promise<CryptoKey>>();

async function deriveConversationKey(myPrivate: CryptoKey, myPublicJwk: string, partnerPublicJwk: string): Promise<CryptoKey> {
  const cacheKey = `${myPublicJwk}|${partnerPublicJwk}`;
  const cached = convKeyCache.get(cacheKey);
  if (cached) return cached;

  const p = (async () => {
    const partnerPub = await crypto.subtle.importKey(
      'jwk',
      JSON.parse(partnerPublicJwk),
      { name: 'ECDH', namedCurve: 'P-256' },
      false,
      [],
    );
    const shared = await crypto.subtle.deriveBits({ name: 'ECDH', public: partnerPub }, myPrivate, 256);
    const hkdfBase = await crypto.subtle.importKey('raw', shared, 'HKDF', false, ['deriveKey']);
    // Salt binds the key to this exact pair of public keys (order-independent).
    const salt = new TextEncoder().encode([myPublicJwk, partnerPublicJwk].sort().join('|'));
    return crypto.subtle.deriveKey(
      { name: 'HKDF', hash: 'SHA-256', salt, info: new TextEncoder().encode('trishulan-dm-v1') },
      hkdfBase,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt'],
    );
  })();

  convKeyCache.set(cacheKey, p);
  p.catch(() => convKeyCache.delete(cacheKey));
  return p;
}

// ── Public API ───────────────────────────────────────────────────────────────
export async function encryptMessage(
  body: DecryptedBody,
  identity: StoredKeyPair,
  partnerPublicJwk: string,
): Promise<string> {
  const key = await deriveConversationKey(identity.privateKey, identity.publicJwk, partnerPublicJwk);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(JSON.stringify({ t: body.text, a: body.attachmentUrl || undefined }));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);
  return `${ENC_PREFIX}${toB64(iv)}:${toB64(ct)}]`;
}

/**
 * Decrypts a stored payload. `msgSenderKey` / `msgReceiverKey` are the public keys
 * snapshotted on the message at send time, so history survives later key rotations
 * as long as THIS browser still holds the matching private key.
 * Returns null if this device cannot decrypt (different device / cleared storage).
 */
export async function decryptMessage(
  payload: string,
  identity: StoredKeyPair,
  msgSenderKey: string | null | undefined,
  msgReceiverKey: string | null | undefined,
): Promise<DecryptedBody | null> {
  if (!payload.startsWith(ENC_PREFIX) || !payload.endsWith(']')) return null;
  if (!msgSenderKey || !msgReceiverKey) return null;

  // Which side am I on this message? My key must match one of the snapshots.
  let partnerKey: string;
  if (identity.publicJwk === msgSenderKey) partnerKey = msgReceiverKey;
  else if (identity.publicJwk === msgReceiverKey) partnerKey = msgSenderKey;
  else return null;

  try {
    const [ivB64, ctB64] = payload.slice(ENC_PREFIX.length, -1).split(':');
    const key = await deriveConversationKey(identity.privateKey, identity.publicJwk, partnerKey);
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(ivB64) as BufferSource }, key, fromB64(ctB64) as BufferSource);
    const parsed = JSON.parse(new TextDecoder().decode(pt));
    return { text: String(parsed.t ?? ''), attachmentUrl: parsed.a || undefined };
  } catch {
    return null;
  }
}

/** Short human-verifiable fingerprint of a public key (compare out-of-band to detect MITM). */
export async function keyFingerprint(publicJwk: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(publicJwk));
  const hex = Array.from(new Uint8Array(digest).slice(0, 10))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return hex.toUpperCase().match(/.{1,4}/g)!.join(' ');
}
