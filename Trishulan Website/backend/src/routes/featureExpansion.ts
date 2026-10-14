import { Router } from 'express';
import { prisma } from '../lib/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { listingSchema } from '../lib/security';

const router = Router();

// POST /api/discovery/search
router.post('/search', async (req, res) => {
  try {
    const { query, category, location } = req.body ?? {};
    if ([query, category, location].some((value) => value !== undefined && typeof value !== 'string')) {
      return res.status(400).json({ error: 'query, category, and location must be strings' });
    }
    const q = (query || '').toLowerCase().trim();
    const cat = (category || '').toUpperCase().trim();
    const loc = (location || '').toLowerCase().trim();
    if (cat && cat !== 'ALL' && !['RAW_MATERIALS', 'MACHINERY', 'SPARES'].includes(cat)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const parsedCategory = cat && cat !== 'ALL' ? listingSchema.shape.category.safeParse(cat) : null;
    if (parsedCategory && !parsedCategory.success) return res.status(400).json({ error: 'Invalid category' });

    const listings = await prisma.listing.findMany({
      where: {
        isPublished: true,
        ...(q ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { sellerName: { contains: q, mode: 'insensitive' } },
          ],
        } : {}),
        ...(parsedCategory?.success ? { category: parsedCategory.data } : {}),
        ...(loc && loc !== 'india' ? { location: { contains: loc, mode: 'insensitive' } } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

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
    if (!req.user?.id) return res.status(401).json({ error: 'Authentication required' });
    if (req.user.role !== 'BUYER') return res.status(403).json({ error: 'Only buyers can view RFQ matches' });

    const rfqsWithQuotes = await prisma.rFQ.findMany({
      where: { buyerId: req.user.id, status: { in: ['OPEN', 'IN_NEGOTIATION'] } },
      include: {
        quotes: {
          where: { status: 'SUBMITTED', validUntil: { gt: new Date() } },
          select: {
            id: true,
            sellerId: true,
            sellerName: true,
            unitPrice: true,
            currency: true,
            leadTimeDays: true,
            incoterm: true,
            freightCost: true,
            taxRatePercent: true,
            paymentTerms: true,
            moq: true,
          },
          orderBy: { unitPrice: 'asc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const topRfq = rfqsWithQuotes[0];
    const comparisonRows = topRfq?.quotes.map((quote) => ({
      id: quote.id,
      quoteId: quote.id,
      rfqId: topRfq.id,
      rfqTitle: topRfq.title,
      sellerId: quote.sellerId,
      supplierName: quote.sellerName,
      matchReason: 'Direct RFQ match',
      moqEta: `${topRfq.quantity} / ${quote.leadTimeDays} days`,
      quoteStatus: 'Quote received',
      unitPriceNumeric: quote.unitPrice,
      unitPrice: `${quote.currency} ${quote.unitPrice.toLocaleString('en-IN')}`,
      currency: quote.currency,
      incoterms: quote.incoterm,
      freightCost: quote.freightCost,
      taxRatePercent: quote.taxRatePercent,
      paymentTerms: quote.paymentTerms,
      leadTimeDays: quote.leadTimeDays,
      freight: quote.freightCost > 0 ? `${quote.currency} ${quote.freightCost.toLocaleString('en-IN')}` : 'Included / Buyer arranged',
    })) ?? [];

    return res.json({
      success: true,
      topNeedSummary: {
        rawString: topRfq
          ? `Need: ${topRfq.title} | ${topRfq.quantity} | target price ${topRfq.targetPrice}`
          : 'No open RFQs are available for comparison.',
      },
      comparisonRows,
      matches: rfqsWithQuotes.map((rfq) => ({
        rfqId: rfq.id,
        title: rfq.title,
        matchedSuppliers: rfq.quotes.map((quote) => ({
          name: quote.sellerName,
          priceQuote: `${quote.currency} ${quote.unitPrice.toLocaleString('en-IN')}`,
          deliveryDays: quote.leadTimeDays,
          incoterm: quote.incoterm,
        })),
      })),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'RFQ matching failed' });
  }
});

// POST /api/discovery/lead-share
router.post('/lead-share', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Authentication required' });

    const { leadTitle, recipientPhone, recipientName } = req.body ?? {};
    if (typeof recipientPhone !== 'string') {
      return res.status(400).json({ error: 'Missing recipient phone number' });
    }
    const phoneDigits = recipientPhone.replace(/[^0-9]/g, '');
    if (phoneDigits.length < 7 || phoneDigits.length > 15) {
      return res.status(400).json({ error: 'recipientPhone must contain 7 to 15 digits' });
    }
    if (typeof leadTitle !== 'string' || !leadTitle.trim()) {
      return res.status(400).json({ error: 'Missing leadTitle' });
    }
    if (recipientName !== undefined && typeof recipientName !== 'string') {
      return res.status(400).json({ error: 'recipientName must be a string' });
    }

    const whatsappShareUrl = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(
      `Check out this industrial lead on Trishulan: ${leadTitle.trim()}`
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
