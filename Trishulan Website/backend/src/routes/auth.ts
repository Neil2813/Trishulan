import { Router } from "express";
import {
  firebaseRegisterSchema,
  loginSchema,
  profileSchema,
  registerSchema,
  signJwtToken,
  FirebaseVerificationUnavailableError,
  verifyFirebaseIdToken,
} from "../lib/security";
import {
  createUserInDb,
  findUserByEmail,
  verifyUserCredentials,
  updateUserProfileInDb,
  getUserFromToken,
} from "../lib/auth";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

const router = Router();

const COOKIE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function authErrorStatus(err: any): number {
  if (err?.name === "ZodError") return 400;
  if (err instanceof FirebaseVerificationUnavailableError) return 503;
  if (
    ["JsonWebTokenError", "NotBeforeError", "TokenExpiredError"].includes(err?.name) ||
    err?.message === "Invalid Firebase identity token" ||
    err?.message === "A verified Firebase email address is required"
  ) return 401;
  return 500;
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
        name: identity.name || identity.email.split("@")[0],
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
      });
      const token = signJwtToken({ id: user.id, email: user.email, role: user.role });
      res.cookie("trishulan_token", token, COOKIE);
      return res.json({ success: true, user });
    }

    const validated = registerSchema.parse(req.body);
    const existing = await findUserByEmail(validated.email);
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const user = await createUserInDb({ ...validated, authProvider: "JWT", verifiedSeller: false });
    const token = signJwtToken({ id: user.id, email: user.email, role: user.role });
    res.cookie("trishulan_token", token, COOKIE);
    return res.json({ success: true, user });
  } catch (err: any) {
    return res.status(authErrorStatus(err)).json({ error: err.message || "Registration failed" });
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
      let user = await findUserByEmail(identity.email);
      if (!user) {
        user = await createUserInDb({
          name: identity.name || identity.email.split("@")[0],
          email: identity.email,
          role: body.role === "SELLER" ? "SELLER" : "BUYER",
          authProvider: "FIREBASE",
          companyName: body.companyName,
          phone: body.phone,
        });
      }
      if (!user) return res.status(500).json({ error: "Failed to create or find user" });
      const token = signJwtToken({ id: user.id, email: user.email, role: user.role });
      res.cookie("trishulan_token", token, COOKIE);
      return res.json({ success: true, user });
    }

    // JWT Password Login
    const { email, password } = loginSchema.parse(body);

    const user = await verifyUserCredentials(email, password);
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const token = signJwtToken({ id: user.id, email: user.email, role: user.role });
    res.cookie("trishulan_token", token, COOKIE);
    return res.json({ success: true, user });
  } catch (err: any) {
    return res.status(authErrorStatus(err)).json({ error: err.message || "Login failed" });
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
  } catch (err: any) {
    return res.status(500).json({ user: null, error: err.message });
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
  } catch (err: any) {
    const status = err?.name === "ZodError" ? 400 : 500;
    return res.status(status).json({ error: err.message });
  }
});

export default router;
