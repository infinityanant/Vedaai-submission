import { Server as SocketServer } from "socket.io";
import { setSocketServer } from "../utils/socketEmitter";

export function setupSockets(io: SocketServer) {
  setSocketServer(io);

  io.on("connection", (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on("subscribe:assignment", ({ assignmentId }: { assignmentId: string }) => {
      socket.join(`assignment:${assignmentId}`);
      socket.emit("subscribed", { assignmentId });
      console.log(`📡 ${socket.id} subscribed to assignment:${assignmentId}`);
    });

    socket.on("unsubscribe:assignment", ({ assignmentId }: { assignmentId: string }) => {
      socket.leave(`assignment:${assignmentId}`);
      console.log(`📡 ${socket.id} unsubscribed from assignment:${assignmentId}`);
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });
}
