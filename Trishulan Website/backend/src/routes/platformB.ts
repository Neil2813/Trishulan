import { Router } from 'express';
import { prisma } from '../lib/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

// GET /api/platform-b/rfqs — Get all wholesale RFQs
router.get('/rfqs', async (_req, res) => {
  try {
    const rfqs = await prisma.rFQ.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json({ rfqs, total: rfqs.length });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch RFQs' });
  }
});

// POST /api/platform-b/rfqs — Post a new Wholesale RFQ (auth required)
router.post('/rfqs', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Authentication required' });

    const { product, quantity, specification, delivery, attachmentName, category } = req.body;
    if (!product || !quantity) {
      return res.status(400).json({ error: 'Missing product name or target quantity' });
    }

    const VALID_CATEGORIES = ['RAW_MATERIALS', 'MACHINERY', 'SPARES'];
    if (!category || !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: `category must be one of: ${VALID_CATEGORIES.join(', ')}` });
    }

    const rfq = await prisma.rFQ.create({
      data: {
        buyerId: req.user.id,
        buyerName: req.user.companyName || req.user.name,
        title: `${product} (${quantity})`,
        category,
        quantity: String(quantity),
        targetPrice: 0,
        details: [
          specification ? `Specification: ${specification}` : null,
          delivery ? `Delivery Target: ${delivery}` : null,
          attachmentName ? `Attachment: ${attachmentName}` : null,
        ].filter(Boolean).join('. ') || '',
        status: 'OPEN',
        documentUrl: attachmentName ? `/documents/${attachmentName}` : null,
      },
    });

    return res.json({ success: true, message: 'Wholesale RFQ successfully broadcast to manufacturers', rfq });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to submit RFQ' });
  }
});

// GET /api/platform-b/activity — Real activity metrics for the authenticated user
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
    return res.status(500).json({ error: err.message || 'Failed to fetch Platform B metrics' });
  }
});

export default router;
