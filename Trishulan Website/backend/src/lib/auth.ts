import { prisma } from "./db";
import { User, UserRole, AuthProvider, SubscriptionTier } from "../types";
import { hashPassword, comparePassword, verifyJwtToken } from "./security";

// ── Create User ─────────────────────────────────────────────────────────────
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
  const passwordHash = data.password
    ? await hashPassword(data.password)
    : null;

  const row = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      role: data.role,
      authProvider: data.authProvider,
      passwordHash: passwordHash ?? undefined,
      companyName: data.companyName,
      phone: data.phone,
      gstNumber: data.gstNumber,
      industrySector: data.industrySector,
      address: data.address,
      city: data.city,
      state: data.state,
      verifiedSeller: data.verifiedSeller ?? false,
      subscriptionTier: "BASIC",
    },
  });

  const { passwordHash: _, ...publicUser } = row as any;
  return publicUser as User;
}

// ── Update Profile ──────────────────────────────────────────────────────────
export async function updateUserProfileInDb(
  userId: string,
  data: Partial<
    Pick<
      User,
      | "name"
      | "companyName"
      | "phone"
      | "gstNumber"
      | "industrySector"
      | "address"
      | "city"
      | "state"
    >
  >
): Promise<User> {
  const row = await prisma.user.update({
    where: { id: userId },
    data,
  });
  const { passwordHash: _, ...publicUser } = row as any;
  return publicUser as User;
}

// ── Find by email ───────────────────────────────────────────────────────────
export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email: email.toLowerCase() } });
}

// ── Verify credentials ──────────────────────────────────────────────────────
export async function verifyUserCredentials(
  email: string,
  password?: string
): Promise<User | null> {
  const row = (await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  })) as any;

  if (!row) return null;

  if (row.authProvider === "JWT" && password) {
    if (!row.passwordHash) return null;
    const valid = await comparePassword(password, row.passwordHash);
    if (!valid) return null;
  }

  const { passwordHash: _, ...publicUser } = row;
  return publicUser as User;
}

// ── Get user from JWT token ─────────────────────────────────────────────────
export async function getUserFromToken(
  token?: string | null
): Promise<User | null> {
  if (!token) return null;

  const decoded = verifyJwtToken(token);
  if (!decoded || !decoded.id) return null;

  const row = (await prisma.user.findUnique({
    where: { id: decoded.id },
  })) as any;

  if (!row) return null;
  const { passwordHash: _, ...publicUser } = row;
  return publicUser as User;
}

// ── Update subscription tier ────────────────────────────────────────────────
export async function updateSubscriptionTier(
  userId: string,
  tier: SubscriptionTier
): Promise<User> {
  const row = await prisma.user.update({
    where: { id: userId },
    data: { subscriptionTier: tier },
  });
  const { passwordHash: _, ...publicUser } = row as any;
  return publicUser as User;
}
