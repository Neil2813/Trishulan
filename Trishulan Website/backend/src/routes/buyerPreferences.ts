import { Router } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

let consentRecord = {
  allowEmailNotifs: true,
  allowWhatsappAlerts: true,
  allowDirectCalls: true,
  preferredCategories: ['RAW_MATERIALS', 'MACHINERY'],
  updatedAt: new Date().toISOString(),
};

let tickets = [
  {
    id: 'tck-101',
    subject: 'RFQ Delivery Clarification',
    status: 'OPEN',
    priority: 'HIGH',
    createdAt: '2026-10-06T10:00:00.000Z',
  }
];

// GET /api/customer/consent
router.get('/consent', async (_req, res) => {
  try {
    return res.json({ consent: consentRecord });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch consent preferences' });
  }
});

// POST /api/customer/consent
router.post('/consent', async (req: AuthenticatedRequest, res) => {
  try {
    const { allowEmailNotifs, allowWhatsappAlerts, allowDirectCalls, preferredCategories } = req.body;
    consentRecord = {
      allowEmailNotifs: Boolean(allowEmailNotifs),
      allowWhatsappAlerts: Boolean(allowWhatsappAlerts),
      allowDirectCalls: Boolean(allowDirectCalls),
      preferredCategories: Array.isArray(preferredCategories) ? preferredCategories : consentRecord.preferredCategories,
      updatedAt: new Date().toISOString(),
    };
    return res.json({ success: true, message: 'Buyer communication preferences updated', consent: consentRecord });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update consent preferences' });
  }
});

// GET /api/customer/workspace
router.get('/workspace', async (_req, res) => {
  try {
    return res.json({
      workspace: {
        activeRfqsCount: 4,
        pendingQuotesCount: 12,
        verifiedSuppliersCount: 28,
        openTicketsCount: tickets.filter(t => t.status === 'OPEN').length,
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch workspace summary' });
  }
});

// POST /api/customer/ticket
router.post('/ticket', async (req: AuthenticatedRequest, res) => {
  try {
    const { subject, details, priority } = req.body;
    if (!subject) return res.status(400).json({ error: 'Missing ticket subject' });

    const newTicket = {
      id: 'tck-' + Math.floor(100 + Math.random() * 900),
      subject,
      details: details || '',
      status: 'OPEN',
      priority: priority || 'MEDIUM',
      createdAt: new Date().toISOString(),
    };

    tickets.unshift(newTicket);
    return res.json({ success: true, message: 'Support ticket submitted to Trishulan Care desk', ticket: newTicket });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to submit ticket' });
  }
});

export default router;
