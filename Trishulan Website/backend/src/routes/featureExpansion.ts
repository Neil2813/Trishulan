import { Router } from 'express';
import { prisma } from '../lib/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

// POST /api/discovery/search
router.post('/search', async (req, res) => {
  try {
    const { query, category, location } = req.body;
    const q = (query || '').toLowerCase().trim();
    const cat = (category || '').toUpperCase().trim();
    const loc = (location || '').toLowerCase().trim();

    let listings = await prisma.listing.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (q) {
      listings = listings.filter((l: any) =>
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        (l.sellerName && l.sellerName.toLowerCase().includes(q))
      );
    }
    if (cat && cat !== 'ALL') {
      listings = listings.filter((l: any) => l.category === cat);
    }
    if (loc && loc !== 'india') {
      listings = listings.filter((l: any) => l.location.toLowerCase().includes(loc));
    }

    const matches = listings.map((l: any) => ({
      id: l.id,
      title: l.title,
      category: l.category,
      sellerName: l.sellerName,
      location: l.location,
      price: l.price,
      matchScore: l.matchScore ?? null,
    }));

    return res.json({ success: true, results: matches, total: matches.length });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Unified search failed' });
  }
});

// GET /api/discovery/match
// Returns real RFQ → quote matches for the authenticated user, or structured compare matrix
router.get('/match', async (req: AuthenticatedRequest, res) => {
  try {
    let comparisonRows = [
      {
        id: 'cmp-1',
        supplierName: 'Apex Steel & Fasteners Corp',
        matchReason: 'Direct specification match (SS304 M12)',
        moqEta: '5,000 pcs / 14 days',
        quoteStatus: 'Quote received',
        unitPrice: '₹14.20 / pc',
        incoterms: 'Ex-Works Chennai',
        freight: 'Standard Road Freight included',
      },
      {
        id: 'cmp-2',
        supplierName: 'Precision Metal Works Pvt Ltd',
        matchReason: 'Grade equivalent + ISO 9001 certified',
        moqEta: '2,500 pcs / 21 days',
        quoteStatus: 'Clarification',
        unitPrice: '₹13.85 / pc',
        incoterms: 'FOR Destination',
        freight: 'Doorstep dispatch',
      },
      {
        id: 'cmp-3',
        supplierName: 'Southern Industrial Supplies',
        matchReason: 'Local supplier (Guindy Industrial Estate)',
        moqEta: '1,000 pcs / 7 days',
        quoteStatus: 'Quote received',
        unitPrice: '₹15.10 / pc',
        incoterms: 'Ex-Warehouse',
        freight: 'Buyer pickup or local courier',
      },
    ];

    let topNeedSummary = {
      rawString: 'Need: SS304 M12 hex bolts | 5,000 pcs | Chennai | delivery within 30 days',
    };

    if (req.user?.id) {
      const rfqsWithQuotes = await prisma.rFQ.findMany({
        where: { buyerId: req.user.id, status: { in: ['OPEN', 'IN_NEGOTIATION'] } },
        include: {
          quotes: {
            where: { status: 'SUBMITTED' },
            select: {
              id: true,
              sellerName: true,
              unitPrice: true,
              currency: true,
              leadTimeDays: true,
              incoterm: true,
            },
            orderBy: { unitPrice: 'asc' },
            take: 5,
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      if (rfqsWithQuotes.length > 0) {
        const topRfq = rfqsWithQuotes[0];
        topNeedSummary = {
          rawString: `Need: ${topRfq.title} | ${topRfq.quantity} | target price ₹${topRfq.targetPrice}`,
        };

        if (topRfq.quotes.length > 0) {
          comparisonRows = topRfq.quotes.map((q, idx) => ({
            id: q.id || `quote-${idx}`,
            supplierName: q.sellerName || `Supplier ${idx + 1}`,
            matchReason: 'Direct RFQ match',
            moqEta: `${topRfq.quantity} / ${q.leadTimeDays || 14} days`,
            quoteStatus: 'Quote received',
            unitPrice: `${q.currency} ${q.unitPrice.toLocaleString('en-IN')}`,
            incoterms: q.incoterm || 'Ex-Works',
            freight: 'Freight aligned to terms',
          }));
        }
      }
    }

    return res.json({
      success: true,
      topNeedSummary,
      comparisonRows,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'RFQ matching failed' });
  }
});

// POST /api/discovery/lead-share
router.post('/lead-share', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Authentication required' });

    const { leadTitle, recipientPhone, recipientName } = req.body;
    if (!recipientPhone) return res.status(400).json({ error: 'Missing recipient phone number' });
    if (!leadTitle) return res.status(400).json({ error: 'Missing leadTitle' });

    const whatsappShareUrl = `https://wa.me/${recipientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
      `Check out this industrial lead on Trishulan: ${leadTitle}`
    )}`;

    return res.json({
      success: true,
      message: `Lead shared via WhatsApp to ${recipientName || recipientPhone}`,
      whatsappShareUrl,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to share lead' });
  }
});

export default router;
