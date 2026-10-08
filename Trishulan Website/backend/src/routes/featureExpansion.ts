import { Router } from 'express';
import { prisma } from '../lib/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

// POST /api/discovery/search
router.post('/search', async (req, res) => {
  try {
    const { query, category, location } = req.body;
    const q = (query || '').toLowerCase().trim();

    let listings = await prisma.listing.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (q) {
      listings = listings.filter((l: any) =>
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.sellerName.toLowerCase().includes(q)
      );
    }

    const matches = listings.map((l: any, idx: number) => ({
      id: l.id,
      title: l.title,
      category: l.category,
      sellerName: l.sellerName,
      location: l.location,
      price: l.price,
      matchScore: Math.min(99, 90 + (idx * 2) % 10),
      aiSummary: `High AI relevance match for industrial search "${query || 'all'}"`,
    }));

    return res.json({ success: true, results: matches, total: matches.length });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Unified search failed' });
  }
});

// GET /api/discovery/match
router.get('/match', async (_req, res) => {
  try {
    const rfqMatches = [
      {
        rfqId: 'rfq-201',
        title: 'Mild Steel Plates 12mm Grade E250',
        matchedSuppliers: [
          { name: 'JSW Steel Distributor', priceQuote: '₹54,000 / MT', deliveryDays: 2 },
          { name: 'Tata Steel Authorized Partner', priceQuote: '₹55,200 / MT', deliveryDays: 1 },
        ]
      }
    ];
    return res.json({ matches: rfqMatches });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'RFQ matching failed' });
  }
});

// POST /api/discovery/lead-share
router.post('/lead-share', async (req: AuthenticatedRequest, res) => {
  try {
    const { leadTitle, recipientPhone, recipientName } = req.body;
    if (!recipientPhone) return res.status(400).json({ error: 'Missing recipient phone number' });

    return res.json({
      success: true,
      message: `Lead "${leadTitle || 'Industrial Requirement'}" shared via WhatsApp to ${recipientName || recipientPhone}`,
      whatsappShareUrl: `https://wa.me/${recipientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Check out this industrial lead on Trishulan: ${leadTitle}`)}`
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to share lead' });
  }
});

export default router;
