import { Router } from "express";
import { prisma } from "../lib/db";
import { getUserFromToken } from "../lib/auth";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

const router = Router();

// GET /api/chat
router.get("/", async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user ?? (await getUserFromToken(req.cookies?.trishulan_token || req.headers.authorization?.replace("Bearer ", "")));
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const rfqId     = req.query.rfqId as string | undefined;
    const partnerId = req.query.partnerId as string | undefined;

    const chats = await prisma.chatMessage.findMany({
      where: {
        OR: [{ senderId: user.id }, { receiverId: user.id }],
        ...(rfqId     ? { rfqId } : {}),
        ...(partnerId ? { OR: [{ senderId: partnerId }, { receiverId: partnerId }] } : {}),
      },
      orderBy: { timestamp: "asc" },
    });

    return res.json({ chats });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/chat
router.post("/", async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user ?? (await getUserFromToken(req.cookies?.trishulan_token || req.headers.authorization?.replace("Bearer ", "")));
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { text, attachmentUrl, receiverId, receiverName, rfqId } = req.body;
    if (!text && !attachmentUrl)
      return res.status(400).json({ error: "Message text or attachment required" });

    const message = await prisma.chatMessage.create({
      data: {
        senderId:      user.id,
        senderName:    user.companyName || user.name,
        receiverId:    receiverId   || user.id,
        receiverName:  receiverName || "Verified Supplier",
        rfqId:         rfqId       || undefined,
        text:          text        || "",
        attachmentUrl: attachmentUrl || undefined,
      },
    });

    return res.json({ success: true, message });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to send message" });
  }
});

export default router;
