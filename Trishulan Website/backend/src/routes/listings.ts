import { Router } from "express";
import { prisma } from "../lib/db";
import { listingSchema } from "../lib/security";
import { getUserFromToken } from "../lib/auth";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

const router = Router();

// GET /api/listings
router.get("/", async (req, res) => {
  try {
    const category = req.query.category as string | undefined;
    const query    = (req.query.query as string | undefined)?.toLowerCase();

    const listings = await prisma.listing.findMany({
      where: {
        ...(category ? { category: category.toUpperCase() as any } : {}),
        ...(query
          ? {
              OR: [
                { title:       { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
                { location:    { contains: query, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ listings });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/listings
router.post("/", async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user ?? (await getUserFromToken(req.cookies?.trishulan_token || req.headers.authorization?.replace("Bearer ", "")));
    if (!user) return res.status(401).json({ error: "Unauthorized. Please login to post a listing." });
    if (user.role !== "SELLER") return res.status(403).json({ error: "Only Sellers can create listings." });

    const validated = listingSchema.parse(req.body);

    const listing = await prisma.listing.create({
      data: {
        title:            validated.title,
        description:      validated.description,
        category:         validated.category as any,
        price:            validated.price,
        unit:             validated.unit,
        location:         validated.location,
        sellerId:         user.id,
        sellerName:       user.companyName || user.name,
        isVerifiedSeller: Boolean(user.verifiedSeller),
        imagePath:        validated.imagePath || "/Bento Box/Machinery.png",
        inStock:          true,
      },
    });

    return res.json({ success: true, listing });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || "Failed to create listing" });
  }
});

export default router;
