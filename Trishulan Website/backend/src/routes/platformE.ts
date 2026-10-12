import { Router } from 'express';
import { prisma } from '../lib/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

// GET /api/platform-e/sme-network
router.get('/sme-network', async (req, res) => {
  try {
    const query = (req.query.query as string | undefined)?.toLowerCase().trim();
    const location = (req.query.location as string | undefined)?.toLowerCase().trim();

    let listings = await prisma.listing.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        seller: {
          select: {
            id: true,
            companyName: true,
            verifiedSeller: true,
            city: true,
            state: true,
          },
        },
      },
    });

    if (query) {
      listings = listings.filter((l: any) =>
        l.title.toLowerCase().includes(query) ||
        (l.sellerName && l.sellerName.toLowerCase().includes(query))
      );
    }
    if (location && location !== 'india') {
      listings = listings.filter((l: any) => l.location.toLowerCase().includes(location));
    }

    const smeNetwork = listings.map((l: any) => {
      const seller = l.seller;
      const isVerified = Boolean(seller?.verifiedSeller ?? l.isVerifiedSeller);
      const hasCatalog = Boolean((seller as any)?.digitalCatalogEnabled);
      const badge: 'VERIFIED_SME' | 'DIGITAL_CATALOG' | 'CERTIFIED' = isVerified
        ? 'VERIFIED_SME'
        : hasCatalog
          ? 'DIGITAL_CATALOG'
          : 'CERTIFIED';

      return {
        id: l.id,
        smeName: seller?.companyName || l.sellerName,
        coreSpecialty: l.title,
        location: l.location,
        employeeCount: null,
        badge,
        hasWebsite: false,
        catalogUrl: `/sme/${l.id}`,
        rating: 4.8,
        reviewsCount: 15,
      };
    });

    return res.json({ smeNetwork, total: smeNetwork.length });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch SME network' });
  }
});

// POST /api/platform-e/rfq (auth required)
router.post('/rfq', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Authentication required' });

    const { smeId, productRequirement, quantity, targetDate, category } = req.body;
    if (!productRequirement) {
      return res.status(400).json({ error: 'Missing product requirement details' });
    }

    const VALID_CATEGORIES = ['RAW_MATERIALS', 'MACHINERY', 'SPARES'];
    const resolvedCategory = VALID_CATEGORIES.includes(category) ? category : null;
    if (!resolvedCategory) {
      return res.status(400).json({ error: `category must be one of: ${VALID_CATEGORIES.join(', ')}` });
    }

    const rfq = await prisma.rFQ.create({
      data: {
        buyerId: req.user.id,
        buyerName: req.user.companyName || req.user.name,
        title: productRequirement,
        category: resolvedCategory,
        quantity: String(quantity || 1),
        targetPrice: 0,
        details: [
          smeId ? `SME Target: ${smeId}` : null,
          targetDate ? `Target Date: ${targetDate}` : null,
        ].filter(Boolean).join('. ') || '',
        status: 'OPEN',
      },
    });

    return res.json({ success: true, message: 'Direct SME RFQ submitted successfully', rfq });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to submit SME RFQ' });
  }
});

// GET /api/platform-e/activity (auth required)
router.get('/activity', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Authentication required' });

    const [newLeads, respondedLeads, openRfqs, weeklyRaw] = await Promise.all([
      prisma.chatMessage.count({ where: { receiverId: req.user.id } }),
      prisma.chatMessage.count({ where: { senderId: req.user.id } }),
      prisma.rFQ.count({ where: { status: 'OPEN' } }),
      prisma.$queryRaw<{ day: number; count: bigint }[]>`
        SELECT EXTRACT(DOW FROM timestamp)::int AS day, COUNT(*)::bigint AS count
        FROM "ChatMessage"
        WHERE ("senderId" = ${req.user.id} OR "receiverId" = ${req.user.id})
          AND timestamp >= NOW() - INTERVAL '7 days'
        GROUP BY day ORDER BY day
      `,
    ]);

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const countMap = new Map(weeklyRaw.map((r) => [r.day, Number(r.count)]));
    const weeklyTrend = dayNames.map((name, i) => ({ day: name, count: countMap.get(i) ?? 0 }));

    return res.json({ metrics: { newLeads, responded: respondedLeads, openRfqs, weeklyTrend } });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch SME activity metrics' });
  }
});

export default router;
