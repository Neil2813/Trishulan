import { Router } from 'express';
import { prisma } from '../lib/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { buildWeeklyTrend, getWeeklyStart } from '../lib/activity';

const router = Router();

// GET /api/platform-e/sme-network
router.get('/sme-network', async (req, res) => {
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
    if (req.user.role !== 'BUYER') return res.status(403).json({ error: 'Only buyers can submit RFQs' });

    const { smeId, productRequirement, quantity, targetDate, category } = req.body ?? {};
    if (typeof productRequirement !== 'string' || !productRequirement.trim()) {
      return res.status(400).json({ error: 'Missing product requirement details' });
    }

    const VALID_CATEGORIES = ['RAW_MATERIALS', 'MACHINERY', 'SPARES'];
    const resolvedCategory = VALID_CATEGORIES.includes(category) ? category : null;
    if (!resolvedCategory) {
      return res.status(400).json({ error: `category must be one of: ${VALID_CATEGORIES.join(', ')}` });
    }
    if (quantity !== undefined && quantity !== null && !String(quantity).trim()) {
      return res.status(400).json({ error: 'quantity cannot be empty' });
    }

    const rfq = await prisma.rFQ.create({
      data: {
        buyerId: req.user.id,
        buyerName: req.user.companyName || req.user.name,
        title: productRequirement.trim(),
        category: resolvedCategory,
        quantity: quantity == null ? '1' : String(quantity).trim(),
        targetPrice: 0,
        details: [
          smeId ? `SME Target: ${smeId}` : null,
          targetDate ? `Target Date: ${targetDate}` : null,
        ].filter(Boolean).join('. ') || `Requirement: ${productRequirement.trim()}`,
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

    const weekStart = getWeeklyStart();
    const [newLeads, respondedLeads, openRfqs, weeklyMessages] = await Promise.all([
      prisma.chatMessage.count({ where: { receiverId: req.user.id } }),
      prisma.chatMessage.count({ where: { senderId: req.user.id } }),
      prisma.rFQ.count({ where: { buyerId: req.user.id, status: 'OPEN' } }),
      prisma.chatMessage.findMany({
        where: {
          OR: [{ senderId: req.user.id }, { receiverId: req.user.id }],
          timestamp: { gte: weekStart },
        },
        select: { timestamp: true },
      }),
    ]);

    const weeklyTrend = buildWeeklyTrend(weeklyMessages.map((message) => message.timestamp));

    return res.json({ metrics: { newLeads, responded: respondedLeads, openRfqs, weeklyTrend } });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch SME activity metrics' });
  }
});

export default router;
