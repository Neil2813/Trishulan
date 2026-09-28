import { Router } from 'express';
import { readDb, writeDb } from '../../src/lib/db';
import { getUserFromToken } from '../../src/lib/auth';
import { ChatMessage } from '../../src/types';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

// GET /api/chat
router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user || await getUserFromToken(req.cookies?.trishulan_token || req.headers.authorization?.replace('Bearer ', ''));
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized. Please login to access chats.' });
    }

    const rfqId = req.query.rfqId as string | undefined;
    const partnerId = req.query.partnerId as string | undefined;

    const db = await readDb();
    let chats = db.chats;

    // Filter to only chats where the user is sender or receiver
    chats = chats.filter(c => c.senderId === user.id || c.receiverId === user.id);

    if (rfqId) {
      chats = chats.filter(c => c.rfqId === rfqId);
    } else if (partnerId) {
      chats = chats.filter(c => c.senderId === partnerId || c.receiverId === partnerId);
    }

    return res.json({ chats });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/chat
router.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user || await getUserFromToken(req.cookies?.trishulan_token || req.headers.authorization?.replace('Bearer ', ''));
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized. Please login to send messages.' });
    }

    const body = req.body;
    const senderId = user.id;
    const senderName = user.companyName || user.name;

    if (!body.text && !body.attachmentUrl) {
      return res.status(400).json({ error: 'Message text or attachment is required' });
    }

    const newMessage: ChatMessage = {
      id: 'msg_' + Math.random().toString(36).substr(2, 9),
      senderId,
      senderName,
      receiverId: body.receiverId || 'seller_default',
      receiverName: body.receiverName || 'Verified Supplier',
      rfqId: body.rfqId,
      text: body.text || '',
      attachmentUrl: body.attachmentUrl,
      timestamp: new Date().toISOString(),
    };

    const db = await readDb();
    db.chats.push(newMessage);
    await writeDb(db);

    return res.json({ success: true, message: newMessage });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to send message' });
  }
});

export default router;
