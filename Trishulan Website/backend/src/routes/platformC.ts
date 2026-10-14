import { Router } from 'express';
import { prisma } from '../lib/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { buildWeeklyTrend, getWeeklyStart } from '../lib/activity';

const router = Router();

// GET /api/platform-c/trade-leads
router.get('/trade-leads', async (req, res) => {
  try {
    const { query: queryParam, location: locationParam } = req.query;
    if (
      (queryParam !== undefined && typeof queryParam !== 'string') ||
      (locationParam !== undefined && typeof locationParam !== 'string')
    ) {
      return res.status(400).json({ error: 'query and location must be strings' });
    }
    const query = queryParam?.toLowerCase().trim();
    const location = locationParam?.toLowerCase().trim();

    let listings = await prisma.listing.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      include: {
        seller: { select: { verifiedSeller: true } },
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
      const isExportReady = Boolean((l as any).exportReady);
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
    if (req.user.role !== 'BUYER') return res.status(403).json({ error: 'Only buyers can submit requirements' });

    const { title, targetPrice, quantity, category, details } = req.body ?? {};
    if (typeof title !== 'string' || !title.trim() || !quantity || !String(quantity).trim()) {
      return res.status(400).json({ error: 'Missing title or quantity' });
    }
    const resolvedTargetPrice = targetPrice == null ? 0 : Number(targetPrice);
    if (!Number.isFinite(resolvedTargetPrice) || resolvedTargetPrice < 0) {
      return res.status(400).json({ error: 'targetPrice must be a non-negative number' });
    }

    const VALID_CATEGORIES = ['RAW_MATERIALS', 'MACHINERY', 'SPARES'];
    if (!category || !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: `category must be one of: ${VALID_CATEGORIES.join(', ')}` });
    }

    const requirement = await prisma.rFQ.create({
      data: {
        buyerId: req.user.id,
        buyerName: req.user.companyName || req.user.name,
        title: title.trim(),
        category,
        quantity: String(quantity).trim(),
        targetPrice: resolvedTargetPrice,
        details: typeof details === 'string' && details.trim() ? details.trim() : `Requirement for ${title.trim()}`,
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

    const weekStart = getWeeklyStart();
    const [newLeads, respondedLeads, openRfqs, weeklyRfqs] = await Promise.all([
      prisma.chatMessage.count({ where: { receiverId: req.user.id } }),
      prisma.chatMessage.count({ where: { senderId: req.user.id } }),
      prisma.rFQ.count({ where: { buyerId: req.user.id, status: 'OPEN' } }),
      prisma.rFQ.findMany({
        where: { buyerId: req.user.id, createdAt: { gte: weekStart } },
        select: { createdAt: true },
      }),
    ]);

    const weeklyTrend = buildWeeklyTrend(weeklyRfqs.map((rfq) => rfq.createdAt));

    return res.json({ metrics: { newLeads, responded: respondedLeads, openRfqs, weeklyTrend } });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch activity dashboard' });
  }
});

export default router;
