import { Router } from "express";
import {
  firebaseRegisterSchema,
  loginSchema,
  profileSchema,
  registerSchema,
  signJwtToken,
  FirebaseConfigurationError,
  FirebaseVerificationUnavailableError,
  verifyFirebaseIdToken,
} from "../lib/security";
import {
  createUserInDb,
  findUserByEmail,
  verifyUserCredentials,
  updateUserProfileInDb,
  getUserFromToken,
  provisionAllowlistedAdmin,
} from "../lib/auth";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { isDatabaseConnectionError } from "../lib/db";

const router = Router();

const COOKIE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function authErrorStatus(err: unknown): number {
  const errorName = err instanceof Error ? err.name : undefined;
  const errorMessage = err instanceof Error ? err.message : undefined;
  if (errorName === "ZodError") return 400;
  if (err instanceof FirebaseVerificationUnavailableError) return 503;
  if (err instanceof FirebaseConfigurationError) return 503;
  if (isDatabaseConnectionError(err)) return 503;
  if (
    ["JsonWebTokenError", "NotBeforeError", "TokenExpiredError"].includes(errorName || "") ||
    errorMessage === "Invalid Firebase identity token" ||
    errorMessage === "A verified Firebase email address is required"
  ) return 401;
  return 500;
}

function authErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof FirebaseConfigurationError) return err.message;
  if (isDatabaseConnectionError(err)) {
    return "The database connection failed. Check the backend DATABASE_URL credentials and connectivity.";
  }
  const status = authErrorStatus(err);
  if (status >= 500) return fallback;
  return err instanceof Error ? err.message : fallback;
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    if (req.body?.authProvider === "FIREBASE") {
      const validated = firebaseRegisterSchema.parse(req.body);
      const identity = await verifyFirebaseIdToken(validated.idToken);
      const existing = await findUserByEmail(identity.email);
      if (existing) return res.status(409).json({ error: "Email already registered" });

      const user = await createUserInDb({
        name: validated.name || identity.name || identity.email.split("@")[0],
        email: identity.email,
        role: validated.role,
        authProvider: "FIREBASE",
        companyName: validated.companyName,
        phone: validated.phone,
        gstNumber: validated.gstNumber,
        panNumber: validated.panNumber,
        industrySector: validated.industrySector,
        address: validated.address,
        city: validated.city,
        state: validated.state,
        verifiedSeller: false,
        subscriptionTier: validated.tier,
      });
      const token = signJwtToken({ id: user.id, email: user.email, role: user.role });
      res.cookie("trishulan_token", token, COOKIE);
      return res.json({ success: true, user });
    }

    const { tier, ...registrationData } = registerSchema.parse(req.body);
    const existing = await findUserByEmail(registrationData.email);
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const user = await createUserInDb({
      ...registrationData,
      authProvider: "JWT",
      verifiedSeller: false,
      subscriptionTier: tier,
    });
    const token = signJwtToken({ id: user.id, email: user.email, role: user.role });
    res.cookie("trishulan_token", token, COOKIE);
    return res.json({ success: true, user });
  } catch (err: unknown) {
    const status = authErrorStatus(err);
    console.error("Authentication registration failed", err instanceof Error ? err.name : "UnknownError");
    return res.status(status).json({
      error: authErrorMessage(err, "Registration is temporarily unavailable. Please try again later."),
    });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const body = req.body ?? {};

    // Firebase SSO
    if (body.authProvider === "FIREBASE") {
      if (typeof body.idToken !== "string" || body.idToken.length === 0) {
        return res.status(400).json({ error: "Firebase identity token is required" });
      }
      const identity = await verifyFirebaseIdToken(body.idToken);
      const user = await findUserByEmail(identity.email);
      if (!user) {
        return res.status(404).json({ error: "No account found for this email. Register first, then sign in." });
      }
      const authorizedUser = await provisionAllowlistedAdmin(user);
      const token = signJwtToken({ id: authorizedUser.id, email: authorizedUser.email, role: authorizedUser.role });
      res.cookie("trishulan_token", token, COOKIE);
      return res.json({ success: true, user: authorizedUser });
    }

    // JWT Password Login
    const { email, password } = loginSchema.parse(body);

    const authenticatedUser = await verifyUserCredentials(email, password);
    const user = authenticatedUser ? await provisionAllowlistedAdmin(authenticatedUser) : null;
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const token = signJwtToken({ id: user.id, email: user.email, role: user.role });
    res.cookie("trishulan_token", token, COOKIE);
    return res.json({ success: true, user });
  } catch (err: unknown) {
    const status = authErrorStatus(err);
    console.error("Authentication login failed", err instanceof Error ? err.name : "UnknownError");
    return res.status(status).json({
      error: authErrorMessage(err, "Sign-in is temporarily unavailable. Please try again later."),
    });
  }
});

// POST /api/auth/logout
router.post("/logout", (_req, res) => {
  res.clearCookie("trishulan_token", { path: "/" });
  return res.json({ success: true });
});

// GET /api/auth/me
router.get("/me", async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user ?? (await getUserFromToken(req.cookies?.trishulan_token || req.headers.authorization?.replace("Bearer ", "")));
    return res.json({ user: user ?? null });
  } catch (err: unknown) {
    const status = authErrorStatus(err);
    console.error("Authentication session lookup failed", err instanceof Error ? err.name : "UnknownError");
    return res.status(status).json({
      user: null,
      error: authErrorMessage(err, "Unable to load your session right now. Please try again later."),
    });
  }
});

// PUT /api/auth/profile
router.put("/profile", async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user ?? (await getUserFromToken(req.cookies?.trishulan_token || req.headers.authorization?.replace("Bearer ", "")));
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const profile = profileSchema.parse(req.body);
    const updated = await updateUserProfileInDb(user.id, profile);
    return res.json({ success: true, user: updated });
  } catch (err: unknown) {
    const status = authErrorStatus(err);
    console.error("Authentication profile update failed", err instanceof Error ? err.name : "UnknownError");
    return res.status(status).json({
      error: authErrorMessage(
        err,
        status >= 500 ? "Unable to update your profile right now. Please try again later." : "Invalid profile details",
      ),
    });
  }
});

export default router;
