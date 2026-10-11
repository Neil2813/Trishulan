import { Router } from 'express';
import { prisma } from '../lib/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

// GET /api/platform-a/suppliers
router.get('/suppliers', async (req, res) => {
  try {
    const query = (req.query.query as string | undefined)?.toLowerCase().trim();
    const location = (req.query.location as string | undefined)?.toLowerCase().trim();
    const category = (req.query.cat as string | undefined)?.toUpperCase().trim();

    let listings = await prisma.listing.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        seller: {
          select: { id: true, companyName: true, verifiedSeller: true, city: true, state: true, responseTimeSla: true, moq: true, hasCertificates: true },
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
    if (category && category !== 'ALL') {
      listings = listings.filter((l: any) => l.category === category);
    }

    const suppliers = listings.map((l: any) => {
      const isVerified = Boolean(l.seller?.verifiedSeller ?? l.isVerifiedSeller);
      const badge: 'VERIFIED' | 'DOCS_LISTED' | 'MANUFACTURER' = isVerified
        ? 'VERIFIED'
        : l.seller?.hasCertificates
          ? 'DOCS_LISTED'
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
        moq: l.seller?.moq ?? l.moq ?? null,
        details: l.description,
        responseTime: l.seller?.responseTimeSla ?? null,
        hasCertificates: l.seller?.hasCertificates ?? false,
      };
    });

    return res.json({ suppliers, total: suppliers.length });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch suppliers' });
  }
});

// GET /api/platform-a/activity
router.get('/activity', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Authentication required' });

    const [newLeads, respondedLeads, openRfqs, weeklyRaw] = await Promise.all([
      prisma.chatMessage.count({ where: { receiverId: req.user.id } }),
      prisma.chatMessage.count({ where: { senderId: req.user.id } }),
      prisma.rFQ.count({ where: { status: 'OPEN' } }),
      // Count messages per day of week (Sun=0 … Sat=6) for the last 7 days
      prisma.$queryRaw<{ day: number; count: bigint }[]>`
        SELECT EXTRACT(DOW FROM timestamp)::int AS day, COUNT(*)::bigint AS count
        FROM "ChatMessage"
        WHERE "receiverId" = ${req.user.id}
          AND timestamp >= NOW() - INTERVAL '7 days'
        GROUP BY day
        ORDER BY day
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

// POST /api/platform-a/inquiry
router.post('/inquiry', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Authentication required' });

    const { supplierId, sellerName, productTitle, text } = req.body;
    if (!supplierId || !text) {
      return res.status(400).json({ error: 'Missing supplierId or inquiry message text' });
    }

    const message = await prisma.chatMessage.create({
      data: {
        senderId: req.user.id,
        senderName: req.user.companyName || req.user.name,
        receiverId: supplierId,
        receiverName: sellerName || '',
        text: `Inquiry for [${productTitle || 'Product'}]: ${text}`,
        isEncrypted: false,
      },
    });

    return res.json({ success: true, message: 'Inquiry submitted successfully', inquiry: message });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to submit inquiry' });
  }
});

export default router;
