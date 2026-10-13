import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { getUserFromToken } from "../lib/auth";
import { allowedOrigins } from "../lib/cors";
import { prisma } from "../lib/db";

let io: Server | null = null;

export function initSocketServer(server: HttpServer): Server {
  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const authToken = socket.handshake.auth?.token;
      const cookieHeader = socket.handshake.headers.cookie || "";
      const cookieToken = cookieHeader
        .split(";")
        .map((cookie) => cookie.trim())
        .find((cookie) => cookie.startsWith("trishulan_token="))
        ?.slice("trishulan_token=".length);
      const token = typeof authToken === "string"
        ? authToken
        : cookieToken
          ? decodeURIComponent(cookieToken)
          : undefined;
      const user = await getUserFromToken(token);
      if (!user) return next(new Error("Authentication required"));

      socket.data.userId = user.id;
      socket.data.userRole = user.role;
      return next();
    } catch (err) {
      return next(err instanceof Error ? err : new Error("Socket authentication failed"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const userId = socket.data.userId as string;
    const userRole = socket.data.userRole as string;
    socket.join(`user:${userId}`);
    console.log(`⚡ WebSocket connected: User ${userId} (${socket.id})`);

    socket.on("typing", async (data: { receiverId?: unknown; isTyping?: unknown }) => {
      if (typeof data?.receiverId !== "string" || typeof data.isTyping !== "boolean") return;
      try {
        const receiver = await prisma.user.findUnique({
          where: { id: data.receiverId },
          select: { id: true, role: true },
        });
        if (!receiver || receiver.role === userRole) return;
        socket.to(`user:${receiver.id}`).emit("user_typing", {
          senderId: userId,
          receiverId: receiver.id,
          isTyping: data.isTyping,
        });
      } catch (err) {
        console.error("Failed to broadcast typing event:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔌 WebSocket disconnected: User ${userId}`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error("Socket.io has not been initialized");
  }
  return io;
}
