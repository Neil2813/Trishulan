import { readDb, writeDb } from './db';
import { User, UserRole, AuthProvider, SubscriptionTier } from '@/types';
import { hashPassword, comparePassword, verifyJwtToken } from './security';

export async function createUserInDb(data: {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  authProvider: AuthProvider;
  companyName?: string;
  phone?: string;
  gstNumber?: string;
  industrySector?: string;
  address?: string;
  city?: string;
  state?: string;
  verifiedSeller?: boolean;
}): Promise<User> {
  const db = await readDb();
  
  const existing = db.users.find(u => u.email.toLowerCase() === data.email.toLowerCase());
  if (existing) {
    throw new Error('User already exists with this email.');
  }

  const id = 'usr_' + Math.random().toString(36).substr(2, 9);
  const passwordHash = data.password ? await hashPassword(data.password) : undefined;
  const createdAt = new Date().toISOString();
  const subscriptionTier: SubscriptionTier = 'BASIC';

  const newUser: User & { passwordHash?: string } = {
    id,
    name: data.name,
    email: data.email,
    role: data.role,
    authProvider: data.authProvider,
    companyName: data.companyName,
    phone: data.phone,
    gstNumber: data.gstNumber,
    industrySector: data.industrySector,
    address: data.address,
    city: data.city,
    state: data.state,
    verifiedSeller: data.verifiedSeller,
    subscriptionTier,
    createdAt,
    passwordHash,
  };

  db.users.push(newUser);
  await writeDb(db);

  const { passwordHash: _, ...publicUser } = newUser;
  return publicUser;
}

export async function updateUserProfileInDb(
  userId: string,
  data: Partial<Pick<User, 'name' | 'companyName' | 'phone' | 'gstNumber' | 'industrySector' | 'address' | 'city' | 'state'>>
): Promise<User> {
  const db = await readDb();
  const userIdx = db.users.findIndex(u => u.id === userId);

  if (userIdx === -1) {
    throw new Error('User not found.');
  }

  const currentUser = db.users[userIdx];
  const updatedUser = {
    ...currentUser,
    ...data,
  };

  db.users[userIdx] = updatedUser;
  await writeDb(db);

  const { passwordHash: _, ...publicUser } = updatedUser as any;
  return publicUser as User;
}

export async function findUserByEmail(email: string) {
  const db = await readDb();
  return db.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function verifyUserCredentials(email: string, password?: string) {
  const db = await readDb();
  const user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase()) as any;
  if (!user) return null;

  if (user.authProvider === 'JWT' && password) {
    if (!user.passwordHash) return null;
    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) return null;
  }

  const { passwordHash: _, ...publicUser } = user;
  return publicUser as User;
}

export async function getUserFromToken(token?: string | null): Promise<User | null> {
  if (!token) return null;

  const decoded = verifyJwtToken(token);
  if (!decoded || !decoded.id) return null;

  const db = await readDb();
  const user = db.users.find(u => u.id === decoded.id);

  if (!user) return null;

  const { passwordHash: _, ...publicUser } = user as any;
  return publicUser as User;
}

export async function getSessionUser(): Promise<User | null> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    let token = cookieStore.get('trishulan_token')?.value;
    if (!token) {
      token = cookieStore.get('trishulan_refresh_token')?.value;
    }

    return getUserFromToken(token);
  } catch {
    return null;
  }
}
