import { Router, Response } from 'express';
import { prisma } from '../lib/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

// POST /api/reviews — Submit post-transaction rating/review
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const reviewerId = req.user?.id;
    if (!reviewerId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { targetUserId, rating, comment, quoteId, rfqId, categories } = req.body;

    if (!targetUserId || typeof targetUserId !== 'string') {
      return res.status(400).json({ error: 'targetUserId is required' });
    }

    if (reviewerId === targetUserId) {
      return res.status(400).json({ error: 'Users cannot rate themselves' });
    }

    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ error: 'rating must be an integer between 1 and 5' });
    }

    // Verify target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, name: true, role: true },
    });
    if (!targetUser) {
      return res.status(404).json({ error: 'Target user not found' });
    }

    // Check for duplicate rating on the same quote if quoteId is provided
    if (quoteId) {
      const existing = await prisma.transactionRating.findFirst({
        where: { reviewerId, quoteId },
      });
      if (existing) {
        return res.status(409).json({ error: 'You have already rated this quote' });
      }
    }

    const newRating = await prisma.transactionRating.create({
      data: {
        reviewerId,
        targetUserId,
        rating: numericRating,
        comment: typeof comment === 'string' ? comment.trim() : null,
        quoteId: typeof quoteId === 'string' ? quoteId : null,
        rfqId: typeof rfqId === 'string' ? rfqId : null,
        categories: categories && typeof categories === 'object' ? categories : {},
      },
    });

    // Recalculate target user's average rating & reviewsCount
    const allUserRatings = await prisma.transactionRating.findMany({
      where: { targetUserId },
      select: { rating: true },
    });

    const reviewsCount = allUserRatings.length;
    const avg = allUserRatings.reduce((sum, r) => sum + r.rating, 0) / reviewsCount;
    const averageRating = Math.round(avg * 10) / 10;

    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        averageRating,
        reviewsCount,
      },
    });

    return res.status(201).json({
      success: true,
      rating: newRating,
      updatedTargetUser: {
        id: targetUserId,
        averageRating,
        reviewsCount,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to submit review' });
  }
});

// GET /api/reviews/user/:userId — Retrieve reviews for a counterparty
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const ratings = await prisma.transactionRating.findMany({
      where: { targetUserId: userId },
      include: {
        reviewer: {
          select: { id: true, name: true, companyName: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { averageRating: true, reviewsCount: true, name: true, companyName: true },
    });

    return res.json({
      averageRating: user?.averageRating ?? 0,
      reviewsCount: user?.reviewsCount ?? 0,
      ratings,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch reviews' });
  }
});

// GET /api/reviews/rfq/:rfqId — Retrieve reviews for an RFQ
router.get('/rfq/:rfqId', async (req, res) => {
  try {
    const { rfqId } = req.params;
    const ratings = await prisma.transactionRating.findMany({
      where: { rfqId },
      include: {
        reviewer: {
          select: { id: true, name: true, companyName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ ratings });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch RFQ reviews' });
  }
});

export default router;
