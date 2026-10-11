import { Router } from 'express';
import { prisma } from '../lib/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { fetchTradeIntelligence } from '../services/marketDataService';

const router = Router();

// GET /api/platform-d/intelligence
// Fetches live trade intelligence from the market data service.
router.get('/intelligence', async (req, res) => {
  try {
    const query = (req.query.query as string | undefined)?.trim();
    const destination = (req.query.destination as string | undefined)?.trim();

    if (!query) return res.status(400).json({ error: 'query parameter is required' });

    const intelligence = await fetchTradeIntelligence(query, destination || 'Global');
    return res.json({ success: true, intelligence });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch intelligence analysis' });
  }
});

// GET /api/platform-d/activity (auth required)
router.get('/activity', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Authentication required' });

    const [newLeads, respondedLeads, openRfqs, weeklyRaw] = await Promise.all([
      prisma.chatMessage.count({ where: { receiverId: req.user.id } }),
      prisma.chatMessage.count({ where: { senderId: req.user.id } }),
      prisma.rFQ.count({ where: { status: 'OPEN' } }),
      prisma.$queryRaw<{ day: number; count: bigint }[]>`
        SELECT EXTRACT(DOW FROM timestamp)::int AS day, COUNT(*)::bigint AS count
        FROM "ChatMessage"
        WHERE ("senderId" = ${req.user.id} OR "receiverId" = ${req.user.id})
          AND timestamp >= NOW() - INTERVAL '7 days'
        GROUP BY day ORDER BY day
      `,
    ]);

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const countMap = new Map(weeklyRaw.map((r) => [r.day, Number(r.count)]));
    const weeklyTrend = dayNames.map((name, i) => ({ day: name, count: countMap.get(i) ?? 0 }));

    return res.json({ metrics: { newLeads, responded: respondedLeads, openRfqs, weeklyTrend } });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch activity metrics' });
  }
});

export default router;
