/**
 * quotes.ts — Structured Quote routes for Side-by-Side Comparison (Guide pp. 14, 30)
 *
 * Endpoints:
 *   POST /api/quotes              — Submit a quote for an RFQ (auth required)
 *   GET  /api/quotes/rfq/:rfqId  — Get all quotes for an RFQ (auth required)
 *   PATCH /api/quotes/:id/status — Accept / Reject / Expire a quote (auth required)
 */

import { Router } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { prisma } from '../lib/db';

const router = Router();

// ────────────────────────────────────────────────────────────────────────────
// POST /api/quotes
// Seller submits a formal quote against an RFQ
// Body: { rfqId, unitPrice, currency, moq, leadTimeDays, freightCost,
//          taxRatePercent, incoterm, paymentTerms, validUntil, notes? }
// ────────────────────────────────────────────────────────────────────────────
router.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Authentication required' });

    const {
      rfqId, unitPrice, currency, moq, leadTimeDays,
      freightCost, taxRatePercent, incoterm, paymentTerms, validUntil, notes,
    } = req.body;

    if (!rfqId || !unitPrice || !moq || !leadTimeDays || !validUntil || !currency || !incoterm || !paymentTerms) {
      return res.status(400).json({
        error: 'rfqId, unitPrice, currency, moq, leadTimeDays, incoterm, paymentTerms, and validUntil are required',
      });
    }

    if (typeof taxRatePercent !== 'number') {
      return res.status(400).json({ error: 'taxRatePercent is required and must be a number' });
    }

    const rfq = await prisma.rFQ.findUnique({ where: { id: rfqId } });
    if (!rfq) return res.status(404).json({ error: 'RFQ not found' });
    if (rfq.status === 'COMPLETED' || rfq.status === 'CANCELLED') {
      return res.status(400).json({ error: 'This RFQ is no longer accepting quotes' });
    }

    const quote = await prisma.quote.create({
      data: {
        rfqId,
        sellerId: req.user.id,
        sellerName: req.user.name || req.user.companyName,
        unitPrice: Number(unitPrice),
        currency,
        moq: String(moq),
        leadTimeDays: Number(leadTimeDays),
        freightCost: freightCost != null ? Number(freightCost) : 0,
        taxRatePercent: Number(taxRatePercent),
        incoterm,
        paymentTerms,
        validUntil: new Date(validUntil),
        notes: notes ?? null,
        status: 'SUBMITTED',
      },
    });

    // Transition RFQ to IN_NEGOTIATION once the first quote arrives
    if (rfq.status === 'OPEN') {
      await prisma.rFQ.update({ where: { id: rfqId }, data: { status: 'IN_NEGOTIATION' } });
    }

    return res.json({ success: true, quote });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to submit quote' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// GET /api/quotes/rfq/:rfqId
// Returns all quotes for an RFQ for side-by-side comparison (auth required)
// ────────────────────────────────────────────────────────────────────────────
router.get('/rfq/:rfqId', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Authentication required' });

    const { rfqId } = req.params;

    const quotes = await prisma.quote.findMany({
      where: { rfqId },
      orderBy: { createdAt: 'asc' },
      include: {
        seller: {
          select: { id: true, name: true, companyName: true, verifiedSeller: true, city: true, state: true },
        },
      },
    });

    return res.json({ quotes });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch quotes' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// PATCH /api/quotes/:id/status
// Accept, reject, or expire a quote
// Body: { status }  — ACCEPTED | REJECTED | EXPIRED
// ────────────────────────────────────────────────────────────────────────────
router.patch('/:id/status', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Authentication required' });

    const { status } = req.body;
    const validStatuses = ['ACCEPTED', 'REJECTED', 'EXPIRED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
    }

    const updated = await prisma.quote.updateMany({
      where: { id: req.params.id },
      data: { status },
    });

    if (updated.count === 0) return res.status(404).json({ error: 'Quote not found' });
    return res.json({ success: true, message: `Quote marked as ${status}` });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update quote status' });
  }
});

export default router;
