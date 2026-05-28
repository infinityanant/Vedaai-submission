import { io, Socket } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Singleton socket instance
let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(BACKEND_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
    });
  }
  return socket;
}

export interface AssignmentStatusEvent {
  assignmentId: string;
  status: "queued" | "generating" | "completed" | "failed";
  paper?: object;
  error?: string;
}

/**
 * Subscribe to real-time status updates for a specific assignment.
 * Returns an unsubscribe function.
 */
export function subscribeToAssignment(
  assignmentId: string,
  onStatus: (data: AssignmentStatusEvent) => void
): () => void {
  const s = getSocket();

  s.emit("subscribe:assignment", { assignmentId });
  s.on("assignment:status", onStatus);

  return () => {
    s.off("assignment:status", onStatus);
    s.emit("unsubscribe:assignment", { assignmentId });
  };
}
