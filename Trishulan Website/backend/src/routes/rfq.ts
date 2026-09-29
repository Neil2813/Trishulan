import { Router } from "express";
import { prisma } from "../lib/db";
import { rfqSchema } from "../lib/security";
import { getUserFromToken } from "../lib/auth";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

const router = Router();

// GET /api/rfq
router.get("/", async (_req, res) => {
  try {
    const rfqs = await prisma.rFQ.findMany({ orderBy: { createdAt: "desc" } });
    return res.json({ rfqs });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/rfq
router.post("/", async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user ?? (await getUserFromToken(req.cookies?.trishulan_token || req.headers.authorization?.replace("Bearer ", "")));
    if (!user) return res.status(401).json({ error: "Unauthorized. Please login to post an RFQ." });
    if (user.role !== "BUYER") return res.status(403).json({ error: "Only Buyers can submit RFQs." });

    const validated = rfqSchema.parse(req.body);

    const rfq = await prisma.rFQ.create({
      data: {
        buyerId:     user.id,
        buyerName:   user.companyName || user.name,
        title:       validated.title,
        category:    validated.category as any,
        quantity:    validated.quantity,
        targetPrice: validated.targetPrice,
        details:     validated.details,
        status:      "OPEN",
        documentUrl: req.body.documentUrl || undefined,
      },
    });

    return res.json({ success: true, rfq });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || "Failed to submit RFQ" });
  }
});

export default router;
