import { Router } from "express";
import { registerSchema, signJwtToken } from "../lib/security";
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

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const validated = registerSchema.parse(req.body);
    const existing = await findUserByEmail(validated.email);
    if (existing) return res.status(400).json({ error: "Email already registered" });

    const user = await createUserInDb({ ...validated, authProvider: "JWT", verifiedSeller: validated.role === "SELLER" });
    const token = signJwtToken({ id: user.id, email: user.email, role: user.role });
    res.cookie("trishulan_token", token, COOKIE);
    return res.json({ success: true, user });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || "Registration failed" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const body = req.body;

    // Firebase SSO
    if (body.authProvider === "FIREBASE") {
      let user = await findUserByEmail(body.email);
      if (!user) {
        user = await createUserInDb({
          name: body.name || body.email.split("@")[0],
          email: body.email,
          role: body.role || "BUYER",
          authProvider: "FIREBASE",
          companyName: body.companyName,
          phone: body.phone,
        });
      }
      const token = signJwtToken({ id: user.id, email: user.email, role: user.role });
      res.cookie("trishulan_token", token, COOKIE);
      return res.json({ success: true, user });
    }

    // JWT Password Login
    const { email, password } = body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const user = await verifyUserCredentials(email, password);
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const token = signJwtToken({ id: user.id, email: user.email, role: user.role });
    res.cookie("trishulan_token", token, COOKIE);
    return res.json({ success: true, user });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Login failed" });
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

    const updated = await updateUserProfileInDb(user.id, req.body);
    return res.json({ success: true, user: updated });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

export default router;
