import { Router } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { prisma } from '../lib/db';

const router = Router();

// ─── Helper: generate case number ───────────────────────────────────────────
function generateCaseNumber(): string {
  return 'CS-' + String(Math.floor(1000 + Math.random() * 9000));
}

// ────────────────────────────────────────────────────────────────────────────
// GET /api/customer/consent
// Returns the latest consent preferences for the authenticated user.
// Falls back to defaults when no record exists (unauthenticated/demo mode).
// ────────────────────────────────────────────────────────────────────────────
router.get('/consent', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Authentication required' });

    const latest = await prisma.buyerConsentLog.findFirst({
      where: { buyerId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      consent: latest
        ? {
            allowPhoneSharing: latest.allowPhoneSharing,
            allowWhatsappAlerts: latest.allowWhatsappAlerts,
            allowMarketing: latest.allowMarketing,
            updatedAt: latest.createdAt.toISOString(),
          }
        : {
            allowPhoneSharing: false,
            allowWhatsappAlerts: false,
            allowMarketing: false,
            updatedAt: new Date().toISOString(),
          },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch consent preferences' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// POST /api/customer/consent
// Persists a new granular buyer consent record to PostgreSQL.
// Body: { allowPhoneSharing, allowWhatsappAlerts, allowMarketing, targetSellerId, rfqId?, consentWording? }
// ────────────────────────────────────────────────────────────────────────────
router.post('/consent', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Authentication required' });

    const {
      allowPhoneSharing,
      allowWhatsappAlerts,
      allowMarketing,
      targetSellerId,
      rfqId,
      consentWording,
    } = req.body;

    const log = await prisma.buyerConsentLog.create({
      data: {
        buyerId: req.user.id,
        targetSellerId: targetSellerId || 'GENERAL',
        rfqId: rfqId || null,
        allowPhoneSharing: Boolean(allowPhoneSharing),
        allowWhatsappAlerts: Boolean(allowWhatsappAlerts),
        allowMarketing: Boolean(allowMarketing),
        consentWording: consentWording || 'User updated communication preferences',
        ipAddress: req.ip || null,
        userAgent: req.headers['user-agent'] || null,
      },
    });

    return res.json({
      success: true,
      message: 'Buyer communication preferences saved to audit log',
      consent: log,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update consent preferences' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// GET /api/customer/workspace
// Returns live workspace stats from PostgreSQL.
// ────────────────────────────────────────────────────────────────────────────
router.get('/workspace', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Authentication required' });

    const [activeRfqs, openTickets, pendingQuotes, verifiedSuppliersCount] = await Promise.all([
      prisma.rFQ.count({ where: { buyerId: req.user.id, status: { in: ['OPEN', 'IN_NEGOTIATION'] } } }),
      prisma.supportTicket.count({ where: { userId: req.user.id, status: 'OPEN' } }),
      prisma.quote.count({ where: { rfq: { buyerId: req.user.id }, status: 'SUBMITTED' } }),
      prisma.user.count({ where: { role: 'SELLER', verifiedSeller: true } }),
    ]);

    return res.json({
      workspace: {
        activeRfqsCount: activeRfqs,
        pendingQuotesCount: pendingQuotes,
        verifiedSuppliersCount,
        openTicketsCount: openTickets,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch workspace summary' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// POST /api/customer/ticket
// Creates a support ticket persisted in PostgreSQL.
// Body: { subject, details, priority, category }
// ────────────────────────────────────────────────────────────────────────────
router.post('/ticket', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Authentication required' });

    const { subject, details, priority, category } = req.body;
    if (!subject) return res.status(400).json({ error: 'Missing ticket subject' });

    const ticket = await prisma.supportTicket.create({
      data: {
        caseNumber: generateCaseNumber(),
        userId: req.user.id,
        category: category || 'Account',
        subject,
        details: details || '',
        priority: priority || 'MEDIUM',
        status: 'OPEN',
      },
    });

    return res.json({
      success: true,
      message: 'Support ticket submitted to Trishulan Care desk',
      ticket,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to submit ticket' });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// GET /api/customer/tickets
// Lists all tickets for the authenticated user.
// ────────────────────────────────────────────────────────────────────────────
router.get('/tickets', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Authentication required' });

    const tickets = await prisma.supportTicket.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return res.json({ tickets });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch tickets' });
  }
});

export default router;
