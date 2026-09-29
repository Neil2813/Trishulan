import { Router } from "express";
import { updateSubscriptionTier } from "../lib/auth";
import { getUserFromToken } from "../lib/auth";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { SubscriptionTier } from "../types";

const router = Router();

// POST /api/subscription
router.post("/", async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user ?? (await getUserFromToken(req.cookies?.trishulan_token || req.headers.authorization?.replace("Bearer ", "")));
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { tier } = req.body;
    if (!["BASIC", "GROWTH", "ENTERPRISE"].includes(tier))
      return res.status(400).json({ error: "Invalid subscription tier" });

    const updated = await updateSubscriptionTier(user.id, tier as SubscriptionTier);
    return res.json({ success: true, tier, user: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
