import { Server as SocketServer } from "socket.io";

let io: SocketServer | null = null;

export function setSocketServer(server: SocketServer) {
  io = server;
}

export function emitJobStatus(assignmentId: string, status: string, data?: object) {
  if (!io) {
    console.warn("Socket.io server not initialised — cannot emit");
    return;
  }
  io.to(`assignment:${assignmentId}`).emit("assignment:status", {
    assignmentId,
    status,
    ...data,
  });
}
