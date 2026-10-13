import { Router } from 'express';
import { prisma } from '../lib/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { buildWeeklyTrend, getWeeklyStart } from '../lib/activity';

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
    if (req.user.role !== 'BUYER') return res.status(403).json({ error: 'Only buyers can submit RFQs' });

    const { product, quantity, specification, delivery, attachmentName, category } = req.body ?? {};
    if (typeof product !== 'string' || !product.trim() || !quantity || !String(quantity).trim()) {
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
        title: `${product.trim()} (${String(quantity).trim()})`,
        category,
        quantity: String(quantity).trim(),
        targetPrice: 0,
        details: [
          specification ? `Specification: ${specification}` : null,
          delivery ? `Delivery Target: ${delivery}` : null,
          attachmentName ? `Attachment: ${attachmentName}` : null,
        ].filter(Boolean).join('. ') || `Wholesale RFQ for ${product.trim()}`,
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
    return res.status(500).json({ error: err.message || 'Failed to fetch Platform B metrics' });
  }
});

export default router;
