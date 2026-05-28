import { Queue } from "bullmq";
import IORedis from "ioredis";

// ---------------------------------------------------------------------------
// Redis connection (shared with the worker)
// ---------------------------------------------------------------------------

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null, // Required for BullMQ
  ...(redisUrl.startsWith("rediss://") ? { tls: {} } : {}),
});

// ---------------------------------------------------------------------------
// Queue
// ---------------------------------------------------------------------------

export const assignmentQueue = new Queue("assignment-generation", {
  connection: connection as any,
});

// ---------------------------------------------------------------------------
// Add a job
// ---------------------------------------------------------------------------

export async function addAssignmentJob(assignmentId: string) {
  const job = await assignmentQueue.add(
    "generate",
    { assignmentId },
    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
    }
  );
  return job;
}
