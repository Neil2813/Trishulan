import { Router } from 'express';
import { prisma } from '../lib/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { fetchTradeIntelligence, MarketDataUnavailableError } from '../services/marketDataService';
import { buildWeeklyTrend, getWeeklyStart } from '../lib/activity';

const router = Router();

// GET /api/platform-d/intelligence
// Fetches live trade intelligence from the market data service.
router.get('/intelligence', async (req, res) => {
  try {
    const { query: queryParam, destination: destinationParam } = req.query;
    if (
      (queryParam !== undefined && typeof queryParam !== 'string') ||
      (destinationParam !== undefined && typeof destinationParam !== 'string')
    ) {
      return res.status(400).json({ error: 'query and destination must be strings' });
    }
    const query = queryParam?.trim();
    const destination = destinationParam?.trim();

    if (!query) return res.status(400).json({ error: 'query parameter is required' });

    const intelligence = await fetchTradeIntelligence(query, destination || 'Global');
    return res.json({ success: true, intelligence, ...intelligence });
  } catch (err: any) {
    const status = err instanceof MarketDataUnavailableError ? 503 : 500;
    return res.status(status).json({ error: err.message || 'Failed to fetch intelligence analysis' });
  }
});

// GET /api/platform-d/activity (auth required)
router.get('/activity', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Authentication required' });

    const weekStart = getWeeklyStart();
    const [newLeads, respondedLeads, openRfqs, weeklyMessages] = await Promise.all([
      prisma.chatMessage.count({ where: { receiverId: req.user.id } }),
      prisma.chatMessage.count({ where: { senderId: req.user.id } }),
      prisma.rFQ.count({ where: { buyerId: req.user.id, status: 'OPEN' } }),
      prisma.chatMessage.findMany({
        where: {
          OR: [{ senderId: req.user.id }, { receiverId: req.user.id }],
          timestamp: { gte: weekStart },
        },
        select: { timestamp: true },
      }),
    ]);

    const weeklyTrend = buildWeeklyTrend(weeklyMessages.map((message) => message.timestamp));

    return res.json({ metrics: { newLeads, responded: respondedLeads, openRfqs, weeklyTrend } });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch activity metrics' });
  }
});

export default router;
