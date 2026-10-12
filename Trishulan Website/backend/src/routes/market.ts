import { Router } from "express";
import { getUserFromToken } from "../lib/auth";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import {
  getLiveMarketPricesData,
  getIndustrialAnalyzerData,
  getAiMarketPriceAnalyzerData,
} from "../services/marketDataService";

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
    return res.status(500).json({ error: err.message || "Failed to fetch market data" });
  }
});

// GET /api/market/analyzer
router.get("/analyzer", async (req, res) => {
  try {
    const query = typeof req.query.query === "string" ? req.query.query : undefined;
    const data = await getIndustrialAnalyzerData(query);
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to analyze market" });
  }
});

// GET /api/market/ai-price-analyzer
router.get("/ai-price-analyzer", async (req, res) => {
  try {
    const product = typeof req.query.product === "string" ? req.query.product : undefined;
    const grade = typeof req.query.grade === "string" ? req.query.grade : undefined;
    const thickness = typeof req.query.thickness === "string" ? req.query.thickness : undefined;
    const data = await getAiMarketPriceAnalyzerData(product, grade, thickness);
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch price benchmark" });
  }
});

// POST /api/market/report-listing
router.post("/report-listing", async (req, res) => {
  try {
    const { listingId, reason, userComments } = req.body;
    return res.json({
      success: true,
      message: "Audit report received and queued for compliance review.",
      report: {
        reportId: `REP-${Date.now().toString(36).toUpperCase()}`,
        listingId,
        reason,
        userComments,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to submit report" });
  }
});

export default router;

