import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const FIREBASE_CERTS_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
let firebaseCerts: Record<string, string> | null = null;
let firebaseCertsExpiresAt = 0;

export class FirebaseVerificationUnavailableError extends Error {
  constructor() {
    super('Unable to verify Firebase identity right now');
    this.name = 'FirebaseVerificationUnavailableError';
  }
}

async function getFirebaseCertificates(): Promise<Record<string, string>> {
  if (firebaseCerts && Date.now() < firebaseCertsExpiresAt) return firebaseCerts;

  let response: Response;
  try {
    response = await fetch(FIREBASE_CERTS_URL);
  } catch {
    throw new FirebaseVerificationUnavailableError();
  }
  if (!response.ok) throw new FirebaseVerificationUnavailableError();

  const certificates = await response.json() as Record<string, string>;
  const maxAge = response.headers.get('cache-control')?.match(/max-age=(\d+)/i)?.[1];
  firebaseCerts = certificates;
  firebaseCertsExpiresAt = Date.now() + (Number(maxAge) || 300) * 1000;
  return certificates;
}

export async function verifyFirebaseIdToken(idToken: string): Promise<{
  email: string;
  name?: string;
}> {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) throw new Error('FIREBASE_PROJECT_ID is not configured');

  const decoded = jwt.decode(idToken, { complete: true });
  if (!decoded || typeof decoded === 'string' || decoded.header.alg !== 'RS256' || !decoded.header.kid) {
    throw new Error('Invalid Firebase identity token');
  }

  const certificates = await getFirebaseCertificates();
  const certificate = certificates[decoded.header.kid];
  if (!certificate) throw new Error('Invalid Firebase identity token');

  const payload = jwt.verify(idToken, certificate, {
    algorithms: ['RS256'],
    audience: projectId,
    issuer: `https://securetoken.google.com/${projectId}`,
  });

  if (
    typeof payload === 'string' ||
    typeof payload.email !== 'string' ||
    payload.email_verified !== true ||
    typeof payload.sub !== 'string' ||
    payload.sub.length === 0
  ) {
    throw new Error('A verified Firebase email address is required');
  }

  return {
    email: payload.email.trim().toLowerCase(),
    ...(typeof payload.name === 'string' ? { name: payload.name } : {}),
  };
}

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL SECURITY ERROR: JWT_SECRET environment variable is missing in production!');
    }
    return 'trishulan_dev_secure_jwt_secret_key_2026_#dev';
  }
  return secret;
}

export function sanitizeInput(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Invalid email address').transform((email) => email.toLowerCase()),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['BUYER', 'SELLER']),
  companyName: z.string().optional(),
  phone: z.string().optional(),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  industrySector: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

export const firebaseRegisterSchema = z.object({
  idToken: z.string().min(1, 'Firebase identity token is required'),
  role: z.enum(['BUYER', 'SELLER']),
  companyName: z.string().optional(),
  phone: z.string().optional(),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  industrySector: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

export const profileSchema = z.object({
  name: z.string().min(2).optional(),
  companyName: z.string().optional(),
  phone: z.string().optional(),
  gstNumber: z.string().optional(),
  industrySector: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
}).strict();

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const listingSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  category: z.enum(['RAW_MATERIALS', 'MACHINERY', 'SPARES']),
  price: z.number().positive(),
  unit: z.string().min(1),
  location: z.string().min(2),
  imagePath: z.string().optional(),
});

export const rfqSchema = z.object({
  title: z.string().min(3),
  category: z.enum(['RAW_MATERIALS', 'MACHINERY', 'SPARES']),
  quantity: z.string().min(1),
  targetPrice: z.number().positive(),
  details: z.string().min(10),
});

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

const revokedTokens = new Set<string>();

export function signAccessToken(payload: object): string {
  const secret = getJwtSecret();
  return jwt.sign({ ...payload, type: 'access' }, secret, { expiresIn: '15m' });
}

export function signRefreshToken(payload: object): string {
  const secret = getJwtSecret();
  return jwt.sign({ ...payload, type: 'refresh' }, secret, { expiresIn: '7d' });
}

export function signJwtToken(payload: object, expiresIn: string | number = '7d'): string {
  const secret = getJwtSecret();
  return jwt.sign(payload, secret, { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] });
}

export function verifyJwtToken(token: string): (jwt.JwtPayload & { id?: string; email?: string; role?: string }) | null {
  try {
    if (revokedTokens.has(token)) return null;
    const secret = getJwtSecret();
    const verified = jwt.verify(token, secret);
    if (typeof verified === 'object' && verified !== null) {
      return verified as jwt.JwtPayload & { id?: string; email?: string; role?: string };
    }
    return null;
  } catch {
    return null;
  }
}

export function revokeToken(token: string): void {
  revokedTokens.add(token);
}

export function requireRole(userRole: string, allowedRoles: ('BUYER' | 'SELLER')[]): boolean {
  return allowedRoles.includes(userRole as 'BUYER' | 'SELLER');
}
