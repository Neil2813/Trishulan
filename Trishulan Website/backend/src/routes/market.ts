import { Router } from "express";
import { getUserFromToken } from "../lib/auth";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { getLiveMarketPricesData } from "../services/marketDataService";

const router = Router();

// GET /api/market
router.get("/", async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user ?? (await getUserFromToken(req.cookies?.trishulan_token || req.headers.authorization?.replace("Bearer ", "")));
    const tier = user ? user.subscriptionTier : "BASIC";

    const livePrices = await getLiveMarketPricesData();

    const marketPrices = livePrices.map((item) => {
      if (tier === "BASIC") {
        const { history7d, history30d, historicalYear, ...basic } = item as any;
        return { ...basic, lockedMessage: "Upgrade to Growth Plan (₹1,999/mo) to unlock price trends." };
      }
      if (tier === "GROWTH") {
        const { historicalYear, ...growth } = item as any;
        return { ...growth, lockedMessage: "Upgrade to Enterprise (₹8,999/mo) for historical & predictive data." };
      }
      return item;
    });

    return res.json({ tier, marketPrices });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
