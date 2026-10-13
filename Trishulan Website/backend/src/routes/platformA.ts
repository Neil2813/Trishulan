import { Router } from 'express';
import { isDatabaseConnectionError, prisma } from '../lib/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { buildWeeklyTrend, getWeeklyStart } from '../lib/activity';
import { listingSchema } from '../lib/security';

const router = Router();

// GET /api/platform-a/suppliers
router.get('/suppliers', async (req, res) => {
  try {
    const { query: queryParam, location: locationParam, cat: categoryParam } = req.query;
    if (
      (queryParam !== undefined && typeof queryParam !== 'string') ||
      (locationParam !== undefined && typeof locationParam !== 'string') ||
      (categoryParam !== undefined && typeof categoryParam !== 'string')
    ) {
      return res.status(400).json({ error: 'query, location, and cat must be strings' });
    }
    const query = queryParam?.toLowerCase().trim();
    const location = locationParam?.toLowerCase().trim();
    const category = categoryParam?.toUpperCase().trim();
    const parsedCategory = category && category !== 'ALL'
      ? listingSchema.shape.category.safeParse(category)
      : null;
    if (parsedCategory && !parsedCategory.success) {
      return res.status(400).json({ error: 'Invalid listing category' });
    }

    let listings = await prisma.listing.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        seller: {
          select: { id: true, companyName: true, verifiedSeller: true, city: true, state: true },
        },
      },
    });

    if (query) {
      listings = listings.filter((l: any) =>
        l.title.toLowerCase().includes(query) ||
        l.description.toLowerCase().includes(query) ||
        (l.sellerName && l.sellerName.toLowerCase().includes(query)) ||
        l.category.toLowerCase().includes(query)
      );
    }
    if (location && location !== 'india') {
      listings = listings.filter((l: any) => l.location.toLowerCase().includes(location));
    }
    if (parsedCategory?.success) {
      listings = listings.filter((l: any) => l.category === parsedCategory.data);
    }

    const suppliers = listings.map((l: any) => {
      const isVerified = Boolean(l.seller?.verifiedSeller ?? l.isVerifiedSeller);
      const badge: 'VERIFIED' | 'DOCS_LISTED' | 'MANUFACTURER' = isVerified
        ? 'VERIFIED'
        : 'MANUFACTURER';

      return {
        id: l.id,
        supplierId: l.sellerId,
        name: l.seller?.companyName || l.sellerName,
        productTitle: l.title,
        category: l.category,
        price: l.price,
        unit: l.unit,
        location: l.location,
        badge,
        productGroupsCount: l.productGroupsCount ?? null,
        moq: (l as any).moq ?? null,
        details: l.description,
        responseTime: null,
        hasCertificates: false,
      };
    });

    return res.json({ suppliers, total: suppliers.length });
  } catch (err: unknown) {
    console.error('Supplier lookup failed', err instanceof Error ? err.name : 'UnknownError');
    if (isDatabaseConnectionError(err)) {
      return res.status(503).json({
        error: 'Supplier data is temporarily unavailable. Check the backend database credentials and connectivity.',
      });
    }
    return res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

// GET /api/platform-a/activity
router.get('/activity', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Authentication required' });

    const weekStart = getWeeklyStart();
    const [newLeads, respondedLeads, openRfqs, weeklyMessages] = await Promise.all([
      prisma.chatMessage.count({ where: { receiverId: req.user.id } }),
      prisma.chatMessage.count({ where: { senderId: req.user.id } }),
      prisma.rFQ.count({ where: { buyerId: req.user.id, status: 'OPEN' } }),
      prisma.chatMessage.findMany({
        where: { receiverId: req.user.id, timestamp: { gte: weekStart } },
        select: { timestamp: true },
      }),
    ]);

    const weeklyTrend = buildWeeklyTrend(weeklyMessages.map((message) => message.timestamp));

    return res.json({ metrics: { newLeads, responded: respondedLeads, openRfqs, weeklyTrend } });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch activity dashboard' });
  }
});

// POST /api/platform-a/inquiry
router.post('/inquiry', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Authentication required' });
    if (req.user.role !== 'BUYER') return res.status(403).json({ error: 'Only buyers can contact suppliers' });

    const { supplierId, productTitle, text } = req.body ?? {};
    if (
      typeof supplierId !== 'string' || !supplierId.trim() ||
      typeof text !== 'string' || !text.trim()
    ) {
      return res.status(400).json({ error: 'Missing supplierId or inquiry message text' });
    }
    if (text.length > 4000) return res.status(400).json({ error: 'Inquiry message is too long' });

    const seller = await prisma.user.findFirst({
      where: { id: supplierId.trim(), role: 'SELLER' },
      select: { id: true, name: true, companyName: true },
    });
    if (!seller) return res.status(404).json({ error: 'Supplier not found' });
    if (productTitle !== undefined && typeof productTitle !== 'string') {
      return res.status(400).json({ error: 'productTitle must be a string' });
    }

    const message = await prisma.chatMessage.create({
      data: {
        senderId: req.user.id,
        senderName: req.user.companyName || req.user.name,
        receiverId: seller.id,
        receiverName: seller.companyName || seller.name,
        text: `Inquiry for [${productTitle?.trim() || 'Product'}]: ${text.trim()}`,
        isEncrypted: false,
      },
    });

    return res.json({ success: true, message: 'Inquiry submitted successfully', inquiry: message });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to submit inquiry' });
  }
});

export default router;
