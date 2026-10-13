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
    if (req.user.role !== 'SELLER') return res.status(403).json({ error: 'Only sellers can submit quotes' });

    const {
      rfqId, unitPrice, currency, moq, leadTimeDays,
      freightCost, taxRatePercent, incoterm, paymentTerms, validUntil, notes,
    } = req.body ?? {};

    if (
      typeof rfqId !== 'string' || !rfqId.trim() ||
      typeof currency !== 'string' || !currency.trim() ||
      (typeof moq !== 'string' && typeof moq !== 'number') || !String(moq).trim() ||
      typeof incoterm !== 'string' || !incoterm.trim() ||
      typeof paymentTerms !== 'string' || !paymentTerms.trim()
    ) {
      return res.status(400).json({
        error: 'rfqId, unitPrice, currency, moq, leadTimeDays, incoterm, paymentTerms, and validUntil are required',
      });
    }

    const price = Number(unitPrice);
    const leadTime = Number(leadTimeDays);
    const freight = freightCost == null ? 0 : Number(freightCost);
    const taxRate = Number(taxRatePercent);
    const expiry = new Date(validUntil);
    if (!Number.isFinite(price) || price <= 0) {
      return res.status(400).json({ error: 'unitPrice must be a positive number' });
    }
    if (!Number.isInteger(leadTime) || leadTime <= 0) {
      return res.status(400).json({ error: 'leadTimeDays must be a positive integer' });
    }
    if (!Number.isFinite(freight) || freight < 0) {
      return res.status(400).json({ error: 'freightCost must be a non-negative number' });
    }
    if (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 100) {
      return res.status(400).json({ error: 'taxRatePercent must be between 0 and 100' });
    }
    if (Number.isNaN(expiry.getTime()) || expiry.getTime() <= Date.now()) {
      return res.status(400).json({ error: 'validUntil must be a future date' });
    }

    const normalizedRfqId = rfqId.trim();
    const result = await prisma.$transaction(async (transaction) => {
      const rfq = await transaction.rFQ.findUnique({ where: { id: normalizedRfqId } });
      if (!rfq) return { outcome: 'NOT_FOUND' as const };
      if (rfq.buyerId === req.user!.id) return { outcome: 'OWN_RFQ' as const };
      if (rfq.status === 'COMPLETED' || rfq.status === 'CANCELLED') {
        return { outcome: 'CLOSED' as const };
      }

      const quote = await transaction.quote.create({
        data: {
          rfqId: normalizedRfqId,
          sellerId: req.user!.id,
          sellerName: req.user!.companyName || req.user!.name,
          unitPrice: price,
          currency: currency.trim().toUpperCase(),
          moq: String(moq).trim(),
          leadTimeDays: leadTime,
          freightCost: freight,
          taxRatePercent: taxRate,
          incoterm: incoterm.trim().toUpperCase(),
          paymentTerms: paymentTerms.trim(),
          validUntil: expiry,
          notes: typeof notes === 'string' ? notes.trim() || null : null,
          status: 'SUBMITTED',
        },
      });

      if (rfq.status === 'OPEN') {
        await transaction.rFQ.update({
          where: { id: normalizedRfqId },
          data: { status: 'IN_NEGOTIATION' },
        });
      }
      return { outcome: 'CREATED' as const, quote };
    });

    if (result.outcome === 'NOT_FOUND') return res.status(404).json({ error: 'RFQ not found' });
    if (result.outcome === 'OWN_RFQ') return res.status(403).json({ error: 'You cannot quote on your own RFQ' });
    if (result.outcome === 'CLOSED') return res.status(400).json({ error: 'This RFQ is no longer accepting quotes' });
    return res.json({ success: true, quote: result.quote });
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

    const rfq = await prisma.rFQ.findUnique({ where: { id: rfqId }, select: { buyerId: true } });
    if (!rfq || (req.user.role === 'BUYER' && rfq.buyerId !== req.user.id)) {
      return res.status(404).json({ error: 'RFQ not found' });
    }

    const quotes = await prisma.quote.findMany({
      where: {
        rfqId,
        ...(req.user.role === 'SELLER' ? { sellerId: req.user.id } : {}),
      },
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

    if (req.user.role !== 'BUYER') {
      return res.status(403).json({ error: 'Only the RFQ buyer can update quote status' });
    }

    const { status } = req.body ?? {};
    const validStatuses = ['ACCEPTED', 'REJECTED', 'EXPIRED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
    }

    const result = await prisma.$transaction(async (transaction) => {
      const quote = await transaction.quote.findUnique({
        where: { id: req.params.id },
        include: { rfq: { select: { buyerId: true, status: true } } },
      });
      if (!quote || quote.rfq.buyerId !== req.user!.id) return 'NOT_FOUND';
      if (quote.status !== 'SUBMITTED') return 'NOT_SUBMITTED';
      if (quote.validUntil <= new Date()) {
        await transaction.quote.update({
          where: { id: quote.id },
          data: { status: 'EXPIRED' },
        });
        return 'EXPIRED';
      }
      if (status === 'ACCEPTED' && !['OPEN', 'IN_NEGOTIATION'].includes(quote.rfq.status)) {
        return 'RFQ_CLOSED';
      }

      const updated = await transaction.quote.updateMany({
        where: { id: quote.id, status: 'SUBMITTED' },
        data: { status },
      });
      if (updated.count === 0) return 'NOT_SUBMITTED';
      if (status === 'ACCEPTED') {
        await transaction.rFQ.update({
          where: { id: quote.rfqId },
          data: { status: 'COMPLETED' },
        });
        await transaction.quote.updateMany({
          where: { rfqId: quote.rfqId, id: { not: quote.id }, status: 'SUBMITTED' },
          data: { status: 'REJECTED' },
        });
      }
      return 'UPDATED';
    });

    if (result === 'NOT_FOUND') return res.status(404).json({ error: 'Quote not found' });
    if (result === 'NOT_SUBMITTED') return res.status(409).json({ error: 'Quote is no longer awaiting a decision' });
    if (result === 'EXPIRED') return res.status(409).json({ error: 'Quote has expired' });
    if (result === 'RFQ_CLOSED') return res.status(409).json({ error: 'RFQ is no longer accepting decisions' });
    return res.json({ success: true, message: `Quote marked as ${status}` });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update quote status' });
  }
});

export default router;
