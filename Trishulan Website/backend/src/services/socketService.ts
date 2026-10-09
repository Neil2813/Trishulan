import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";

let io: Server | null = null;

export function initSocketServer(server: HttpServer): Server {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || true,
      credentials: true,
    },
  });

  io.on("connection", (socket: Socket) => {
    const userId = socket.handshake.query.userId as string;
    if (userId) {
      socket.join(`user:${userId}`);
      console.log(`⚡ WebSocket connected: User ${userId} (${socket.id})`);
    }

    socket.on("join_room", (roomId: string) => {
      socket.join(roomId);
    });

    socket.on("send_message", (messageData: any) => {
      // Emit to direct user channel
      if (messageData.receiverId) {
        socket.to(`user:${messageData.receiverId}`).emit("new_message", messageData);
      }
      // Also broadcast to room if applicable
      if (messageData.roomId) {
        socket.to(messageData.roomId).emit("new_message", messageData);
      }
    });

    socket.on("typing", (data: { senderId: string; receiverId: string; isTyping: boolean }) => {
      socket.to(`user:${data.receiverId}`).emit("user_typing", data);
    });

    socket.on("disconnect", () => {
      if (userId) {
        console.log(`🔌 WebSocket disconnected: User ${userId}`);
      }
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
