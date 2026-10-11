import { Router } from 'express';
import { prisma } from '../lib/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

// GET /api/platform-c/trade-leads
router.get('/trade-leads', async (req, res) => {
  try {
    const query = (req.query.query as string | undefined)?.toLowerCase().trim();
    const location = (req.query.location as string | undefined)?.toLowerCase().trim();

    let listings = await prisma.listing.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        seller: { select: { verifiedSeller: true, exportReady: true, moq: true } },
      },
    });

    if (query) {
      listings = listings.filter((l: any) =>
        l.title.toLowerCase().includes(query) ||
        l.description.toLowerCase().includes(query) ||
        (l.sellerName && l.sellerName.toLowerCase().includes(query))
      );
    }
    if (location && location !== 'india') {
      listings = listings.filter((l: any) => l.location.toLowerCase().includes(location));
    }

    const tradeLeads = listings.map((l: any) => {
      const isVerified = Boolean(l.seller?.verifiedSeller ?? l.isVerifiedSeller);
      const isExportReady = Boolean(l.seller?.exportReady ?? l.exportReady);
      const badge: 'VERIFIED' | 'EXPORT_READY' | 'ACTIVE_LEAD' = isVerified
        ? 'VERIFIED'
        : isExportReady
          ? 'EXPORT_READY'
          : 'ACTIVE_LEAD';

      return {
        id: l.id,
        title: l.title,
        buyerName: l.sellerName,
        location: l.location,
        category: l.category,
        quantity: l.seller?.moq ?? l.moq ?? null,
        targetPrice: `₹${l.price} / ${l.unit}`,
        badge,
        matchScore: l.matchScore ?? null,
        details: l.description,
        postedDate: l.createdAt,
      };
    });

    return res.json({ tradeLeads, total: tradeLeads.length });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch trade leads' });
  }
});

// POST /api/platform-c/requirement (auth required)
router.post('/requirement', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Authentication required' });

    const { title, targetPrice, quantity, category, details } = req.body;
    if (!title || !quantity) {
      return res.status(400).json({ error: 'Missing title or quantity' });
    }

    const VALID_CATEGORIES = ['RAW_MATERIALS', 'MACHINERY', 'SPARES'];
    if (!category || !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: `category must be one of: ${VALID_CATEGORIES.join(', ')}` });
    }

    const requirement = await prisma.rFQ.create({
      data: {
        buyerId: req.user.id,
        buyerName: req.user.companyName || req.user.name,
        title,
        category,
        quantity: String(quantity),
        targetPrice: Number(targetPrice) || 0,
        details: details || null,
        status: 'OPEN',
      },
    });

    return res.json({ success: true, message: 'Trade requirement successfully posted to network', requirement });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to submit requirement' });
  }
});

// GET /api/platform-c/activity (auth required)
router.get('/activity', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Authentication required' });

    const [newLeads, respondedLeads, openRfqs, weeklyRaw] = await Promise.all([
      prisma.chatMessage.count({ where: { receiverId: req.user.id } }),
      prisma.chatMessage.count({ where: { senderId: req.user.id } }),
      prisma.rFQ.count({ where: { status: 'OPEN' } }),
      prisma.$queryRaw<{ day: number; count: bigint }[]>`
        SELECT EXTRACT(DOW FROM "createdAt")::int AS day, COUNT(*)::bigint AS count
        FROM "RFQ"
        WHERE "buyerId" = ${req.user.id}
          AND "createdAt" >= NOW() - INTERVAL '7 days'
        GROUP BY day ORDER BY day
      `,
    ]);

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const countMap = new Map(weeklyRaw.map((r) => [r.day, Number(r.count)]));
    const weeklyTrend = dayNames.map((name, i) => ({ day: name, count: countMap.get(i) ?? 0 }));

    return res.json({ metrics: { newLeads, responded: respondedLeads, openRfqs, weeklyTrend } });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch activity dashboard' });
  }
});

export default router;
