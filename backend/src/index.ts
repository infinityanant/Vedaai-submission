import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import http from "http";
import mongoose from "mongoose";
import { Server as SocketServer } from "socket.io";

import { setupSockets } from "./sockets/socketSetup";
import { startWorker } from "./workers/assignmentWorker";
import assignmentRoutes from "./routes/assignmentRoutes";
import { connection as redisConnection } from "./queues/assignmentQueue";

const app = express();
const server = http.createServer(app);

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
app.use(
  cors({
    origin: CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// ---------------------------------------------------------------------------
// Body parsing
// ---------------------------------------------------------------------------
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ---------------------------------------------------------------------------
// Request logging
// ---------------------------------------------------------------------------
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${req.method}] ${req.path} - ${new Date().toISOString()}`);
  next();
});

// ---------------------------------------------------------------------------
// Socket.io
// ---------------------------------------------------------------------------
const io = new SocketServer(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

setupSockets(io);

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/assignments", assignmentRoutes);

// ---------------------------------------------------------------------------
// 404 handler
// ---------------------------------------------------------------------------
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

// ---------------------------------------------------------------------------
// Global error handler
// ---------------------------------------------------------------------------
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
const PORT = parseInt(process.env.PORT || "3001", 10);

async function bootstrap() {
  // Connect MongoDB
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("❌ MONGODB_URI is not set in environment variables");
    process.exit(1);
  }
  await mongoose.connect(mongoUri);
  console.log("✅ Connected to MongoDB");

  // Redis is connected via ioredis in assignmentQueue — just verify
  redisConnection.on("connect", () => console.log("✅ Connected to Redis"));
  redisConnection.on("error", (err) => console.error("❌ Redis error:", err));

  // Start BullMQ worker
  startWorker();
  console.log("✅ BullMQ worker started");

  // Listen
  server.listen(PORT, () => {
    console.log(`🚀 VedaAI Backend running on port ${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});

// ---------------------------------------------------------------------------
// Graceful shutdown
// ---------------------------------------------------------------------------
const shutdown = async () => {
  console.log("\nShutting down gracefully...");
  try {
    await mongoose.connection.close();
    redisConnection.disconnect();
  } catch {
    // ignore cleanup errors
  }
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
