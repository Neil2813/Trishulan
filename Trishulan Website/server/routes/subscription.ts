import { Router } from 'express';
import { readDb, writeDb } from '../../src/lib/db';
import { getUserFromToken } from '../../src/lib/auth';
import { SubscriptionTier } from '../../src/types';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

// POST /api/subscription
router.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user || await getUserFromToken(req.cookies?.trishulan_token || req.headers.authorization?.replace('Bearer ', ''));
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized. Please login to manage subscription.' });
    }

    const { tier } = req.body;
    if (!['BASIC', 'GROWTH', 'ENTERPRISE'].includes(tier)) {
      return res.status(400).json({ error: 'Invalid subscription tier.' });
    }

    const db = await readDb();
    const dbUser = db.users.find(u => u.id === user.id);
    if (!dbUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    dbUser.subscriptionTier = tier as SubscriptionTier;
    await writeDb(db);

    return res.json({ success: true, tier });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
