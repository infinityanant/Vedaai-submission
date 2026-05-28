import { Worker, Job } from "bullmq";
import { connection } from "../queues/assignmentQueue";
import { Assignment } from "../models/Assignment";
import { generateQuestionPaper } from "../services/aiService";
import { emitJobStatus } from "../utils/socketEmitter";

let worker: Worker | null = null;

async function processJob(job: Job<{ assignmentId: string }>) {
  const { assignmentId } = job.data;
  console.log(`🔨 Processing job ${job.id} for assignment ${assignmentId}`);

  try {
    // Mark as generating
    await Assignment.findByIdAndUpdate(assignmentId, { status: "generating" });
    emitJobStatus(assignmentId, "generating");

    // Fetch assignment details
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      throw new Error(`Assignment ${assignmentId} not found`);
    }

    // Generate the paper via Gemini
    const paper = await generateQuestionPaper({
      title: assignment.title,
      subject: assignment.subject,
      instructions: assignment.instructions || "",
      questionTypes: assignment.questionTypes.map((qt) => ({
        type: qt.type,
        count: qt.count,
        marksEach: qt.marksEach,
      })),
    });

    // Save the result
    await Assignment.findByIdAndUpdate(assignmentId, {
      status: "completed",
      generatedPaper: paper,
    });
    emitJobStatus(assignmentId, "completed", { paper });

    console.log(`✅ Job ${job.id} completed for assignment ${assignmentId}`);
    return paper;
  } catch (error: any) {
    console.error(`❌ Job ${job.id} failed:`, error.message);

    await Assignment.findByIdAndUpdate(assignmentId, {
      status: "failed",
      errorMessage: error.message,
    });
    emitJobStatus(assignmentId, "failed", { error: error.message });

    // Re-throw so BullMQ can handle retries
    throw error;
  }
}

export function startWorker(): Worker {
  if (worker) return worker;

  worker = new Worker("assignment-generation", processJob, {
    connection: connection as any,
    concurrency: 2,
  });

  worker.on("completed", (job) => {
    console.log(`📋 Worker: job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`📋 Worker: job ${job?.id} failed — ${err.message}`);
  });

  return worker;
}
