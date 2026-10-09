import { Router, Response } from "express";
import { prisma } from "../lib/db";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { getIO } from "../services/socketService";

const router = Router();

/**
 * Trishulan 1-on-1 Direct Messaging (E2EE)
 *
 * Privacy rules enforced on EVERY endpoint:
 *  - The caller can only read messages where they are the sender or the receiver.
 *  - DMs are only allowed between a BUYER and a SELLER (no buyer↔buyer / seller↔seller).
 *  - The server never sees plaintext: message bodies are encrypted in the browser
 *    (ECDH P-256 + AES-GCM-256) and stored as opaque `[ENC:v1:...]` payloads.
 */

const ENC_PREFIX = "[ENC:v1:";
const MAX_PAYLOAD = 20_000;

function requireUser(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  return req.user;
}

const publicUserSelect = {
  id: true,
  name: true,
  companyName: true,
  role: true,
  city: true,
  state: true,
  verifiedSeller: true,
  chatPublicKey: true,
} as const;

function isValidJwk(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 2000) return false;
  try {
    const jwk = JSON.parse(value);
    return jwk.kty === "EC" && jwk.crv === "P-256" && typeof jwk.x === "string" && typeof jwk.y === "string" && !jwk.d;
  } catch {
    return false;
  }
}

// PUT /api/chat/keys — register / rotate the caller's E2EE public key
router.put("/keys", async (req: AuthenticatedRequest, res) => {
  const user = requireUser(req, res);
  if (!user) return;
  const { publicKey } = req.body ?? {};
  if (!isValidJwk(publicKey)) return res.status(400).json({ error: "Invalid public key" });

  try {
    await prisma.user.update({ where: { id: user.id }, data: { chatPublicKey: publicKey } });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to register key" });
  }
});

// GET /api/chat/contacts?q= — counterparties the caller may start a DM with (opposite role only)
router.get("/contacts", async (req: AuthenticatedRequest, res) => {
  const user = requireUser(req, res);
  if (!user) return;
  try {
    const q = (req.query.q as string | undefined)?.trim();
    const oppositeRole = user.role === "SELLER" ? "BUYER" : "SELLER";

    const contacts = await prisma.user.findMany({
      where: {
        role: oppositeRole,
        id: { not: user.id },
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { companyName: { contains: q, mode: "insensitive" } },
                { city: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      select: publicUserSelect,
      orderBy: { name: "asc" },
      take: 50,
    });
    return res.json({ contacts });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/chat/conversations — the caller's own inbox (one row per partner)
router.get("/conversations", async (req: AuthenticatedRequest, res) => {
  const user = requireUser(req, res);
  if (!user) return;
  try {
    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [{ senderId: user.id }, { receiverId: user.id }],
        NOT: { senderId: user.id, receiverId: user.id }, // ignore legacy self-addressed rows
      },
      orderBy: { timestamp: "desc" },
      take: 1000,
    });

    const byPartner = new Map<string, { last: (typeof messages)[number]; unread: number }>();
    for (const m of messages) {
      const partnerId = m.senderId === user.id ? m.receiverId : m.senderId;
      const entry = byPartner.get(partnerId);
      const isUnread = m.receiverId === user.id && !m.read ? 1 : 0;
      if (!entry) byPartner.set(partnerId, { last: m, unread: isUnread });
      else entry.unread += isUnread;
    }

    const partners = await prisma.user.findMany({
      where: { id: { in: [...byPartner.keys()] } },
      select: publicUserSelect,
    });

    const conversations = partners
      .filter((p) => p.role !== user.role) // never surface same-role threads
      .map((partner) => {
        const { last, unread } = byPartner.get(partner.id)!;
        return { partner, lastMessage: last, unread };
      })
      .sort((a, b) => +new Date(b.lastMessage.timestamp) - +new Date(a.lastMessage.timestamp));

    const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);
    return res.json({ conversations, totalUnread });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/chat?partnerId=...&after=ISO — messages between caller and ONE partner
router.get("/", async (req: AuthenticatedRequest, res) => {
  const user = requireUser(req, res);
  if (!user) return;
  try {
    const partnerId = req.query.partnerId as string | undefined;
    const after = req.query.after as string | undefined;
    if (!partnerId) return res.status(400).json({ error: "partnerId is required" });

    const partner = await prisma.user.findUnique({ where: { id: partnerId }, select: publicUserSelect });
    if (!partner || partner.role === user.role) return res.status(404).json({ error: "Conversation not found" });

    const chats = await prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: user.id, receiverId: partnerId },
          { senderId: partnerId, receiverId: user.id },
        ],
        ...(after ? { timestamp: { gt: new Date(after) } } : {}),
      },
      orderBy: { timestamp: "asc" },
      take: 500,
    });

    // Attach listing context cards (public catalog data) where referenced
    const listingIds = [...new Set(chats.map((c) => c.listingId).filter(Boolean))] as string[];
    const listings = listingIds.length
      ? await prisma.listing.findMany({
          where: { id: { in: listingIds } },
          select: { id: true, title: true, price: true, unit: true, location: true, category: true, imagePath: true },
        })
      : [];

    return res.json({ partner, chats, listings });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/chat — send an encrypted DM
router.post("/", async (req: AuthenticatedRequest, res) => {
  const user = requireUser(req, res);
  if (!user) return;
  try {
    const { receiverId, text, senderKey, receiverKey, rfqId, listingId, attachmentUrl } = req.body ?? {};

    if (!receiverId || receiverId === user.id) return res.status(400).json({ error: "Valid receiverId required" });
    if (typeof text !== "string" || !text.startsWith(ENC_PREFIX) || text.length > MAX_PAYLOAD)
      return res.status(400).json({ error: "Messages must be end-to-end encrypted" });
    if (!isValidJwk(senderKey) || !isValidJwk(receiverKey))
      return res.status(400).json({ error: "Encryption keys missing" });

    const [sender, receiver] = await Promise.all([
      prisma.user.findUnique({ where: { id: user.id }, select: publicUserSelect }),
      prisma.user.findUnique({ where: { id: receiverId }, select: publicUserSelect }),
    ]);
    if (!sender || !receiver) return res.status(404).json({ error: "Recipient not found" });
    if (sender.role === receiver.role)
      return res.status(403).json({ error: "Direct messages are only allowed between buyers and sellers" });
    if (sender.chatPublicKey !== senderKey || receiver.chatPublicKey !== receiverKey)
      return res.status(409).json({ error: "Encryption keys changed. Please refresh and retry." });

    const message = await prisma.chatMessage.create({
      data: {
        senderId: sender.id,
        senderName: sender.companyName || sender.name,
        receiverId: receiver.id,
        receiverName: receiver.companyName || receiver.name,
        text,
        isEncrypted: true,
        senderKey,
        receiverKey,
        rfqId: typeof rfqId === "string" ? rfqId : undefined,
        listingId: typeof listingId === "string" ? listingId : undefined,
        attachmentUrl: typeof attachmentUrl === "string" ? attachmentUrl : undefined,
      },
    });

    // Broadcast over WebSockets in real-time
    try {
      getIO().to(`user:${receiver.id}`).emit("new_message", message);
    } catch {
      // Socket.io emission non-blocking fallback
    }

    return res.json({ success: true, message });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to send message" });
  }
});

// PATCH /api/chat/read — mark messages FROM partner TO caller as read
router.patch("/read", async (req: AuthenticatedRequest, res) => {
  const user = requireUser(req, res);
  if (!user) return;
  const { partnerId } = req.body ?? {};
  if (!partnerId) return res.status(400).json({ error: "partnerId is required" });
  try {
    const result = await prisma.chatMessage.updateMany({
      where: { senderId: partnerId, receiverId: user.id, read: false },
      data: { read: true },
    });
    return res.json({ success: true, updated: result.count });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to mark as read" });
  }
});

export default router;
