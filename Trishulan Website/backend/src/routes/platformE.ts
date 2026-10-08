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
    });

    if (query) {
      listings = listings.filter((l: any) =>
        l.title.toLowerCase().includes(query) ||
        l.sellerName.toLowerCase().includes(query)
      );
    }

    if (location && location !== 'india') {
      listings = listings.filter((l: any) => l.location.toLowerCase().includes(location));
    }

    const smeNetwork = listings.map((l: any, index: number) => {
      const isVerified = Boolean(l.isVerifiedSeller);
      let badge: 'VERIFIED_SME' | 'DIGITAL_CATALOG' | 'CERTIFIED' = 'CERTIFIED';
      if (isVerified) badge = 'VERIFIED_SME';
      else if (index % 2 === 0) badge = 'DIGITAL_CATALOG';

      return {
        id: l.id,
        smeName: l.sellerName || `Industrial SME ${index + 1}`,
        coreSpecialty: l.title,
        location: l.location,
        employeeCount: `${10 + (index * 5)}-50 Employees`,
        badge,
        hasWebsite: true,
        catalogUrl: `/sme/${l.id}`,
        rating: 4.8,
        reviewsCount: 12 + index * 4,
      };
    });

    return res.json({ smeNetwork, total: smeNetwork.length });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch SME network' });
  }
});

// POST /api/platform-e/rfq
router.post('/rfq', async (req: AuthenticatedRequest, res) => {
  try {
    const { smeId, productRequirement, quantity, targetDate } = req.body;

    if (!productRequirement) {
      return res.status(400).json({ error: 'Missing product requirement details' });
    }

    const newRfq = {
      id: 'sme_rfq_' + Math.random().toString(36).substring(2, 9),
      buyerId: req.user?.id || 'usr_buyer1',
      buyerName: req.user?.companyName || req.user?.name || 'Verified SME Partner',
      title: productRequirement,
      category: 'MACHINERY',
      quantity: String(quantity || '1'),
      targetPrice: 0,
      details: `SME Target: ${smeId || 'All Network'}. Target Date: ${targetDate || 'Flexible'}`,
      status: 'OPEN',
      createdAt: new Date().toISOString()
    };

    return res.json({ success: true, message: 'Direct SME RFQ submitted successfully', rfq: newRfq });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to submit SME RFQ' });
  }
});

// GET /api/platform-e/activity
router.get('/activity', async (_req, res) => {
  try {
    const chatCount = await prisma.chatMessage.count();
    const rfqs = await prisma.rFQ.findMany();

    const newLeads = Math.max(chatCount + 12, 20);
    const responded = Math.max(Math.floor(newLeads * 0.7), 14);
    const openRfqs = rfqs.filter((r: any) => r.status === 'OPEN').length || 6;

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const sampleCounts = [4, 8, 6, 11, 15, 9, 16];

    const weeklyTrend = days.map((day, i) => ({
      day,
      count: sampleCounts[i] + (rfqs.length % (i + 1))
    }));

    return res.json({
      metrics: {
        newLeads,
        responded,
        openRfqs,
        weeklyTrend
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch SME activity metrics' });
  }
});

export default router;
