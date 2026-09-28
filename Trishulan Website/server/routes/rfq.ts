import { Router } from 'express';
import { readDb, writeDb } from '../../src/lib/db';
import { rfqSchema } from '../../src/lib/security';
import { getUserFromToken } from '../../src/lib/auth';
import { RFQ } from '../../src/types';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

// GET /api/rfq
router.get('/', async (_req, res) => {
  try {
    const db = await readDb();
    return res.json({ rfqs: db.rfqs });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/rfq
router.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user || await getUserFromToken(req.cookies?.trishulan_token || req.headers.authorization?.replace('Bearer ', ''));
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized. Please login to post an RFQ.' });
    }

    if (user.role !== 'BUYER') {
      return res.status(403).json({ error: 'Forbidden. Only registered Buyers are authorized to submit RFQs and procurement requirements.' });
    }

    const body = req.body;
    const validated = rfqSchema.parse(body);

    const newRfq: RFQ = {
      id: 'rfq_' + Math.random().toString(36).substr(2, 9),
      buyerId: user.id,
      buyerName: user.companyName || user.name,
      title: validated.title,
      category: validated.category,
      quantity: validated.quantity,
      targetPrice: validated.targetPrice,
      details: validated.details,
      status: 'OPEN',
      documentUrl: body.documentUrl || undefined,
      createdAt: new Date().toISOString(),
    };

    const db = await readDb();
    db.rfqs.unshift(newRfq);
    await writeDb(db);

    return res.json({ success: true, rfq: newRfq });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to submit RFQ' });
  }
});

export default router;
