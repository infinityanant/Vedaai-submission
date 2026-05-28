import { Request, Response } from "express";
import { Assignment } from "../models/Assignment";
import { addAssignmentJob } from "../queues/assignmentQueue";

// ---------------------------------------------------------------------------
// POST /api/assignments — Create a new assignment & queue generation
// ---------------------------------------------------------------------------

export async function createAssignment(req: Request, res: Response) {
  try {
    const { title, subject, dueDate, instructions, questionTypes } = req.body;

    // Validate required fields
    if (!title || !subject || !dueDate) {
      return res.status(400).json({ error: "title, subject, and dueDate are required" });
    }
    if (!questionTypes || !Array.isArray(questionTypes) || questionTypes.length === 0) {
      return res.status(400).json({ error: "questionTypes must be a non-empty array" });
    }

    // Compute total marks
    const totalMarks = questionTypes.reduce(
      (sum: number, qt: { count: number; marksEach: number }) => sum + qt.count * qt.marksEach,
      0
    );

    // Create assignment
    const assignment = new Assignment({
      title,
      subject,
      dueDate: new Date(dueDate),
      instructions: instructions || "",
      questionTypes,
      totalMarks,
      status: "pending",
    });
    await assignment.save();

    // Queue the generation job
    const job = await addAssignmentJob(assignment._id.toString());
    assignment.status = "queued";
    assignment.jobId = job.id;
    await assignment.save();

    return res.status(201).json({ assignment, jobId: job.id });
  } catch (error: any) {
    console.error("createAssignment error:", error);
    return res.status(500).json({ error: "Failed to create assignment", message: error.message });
  }
}

// ---------------------------------------------------------------------------
// GET /api/assignments — List all assignments
// ---------------------------------------------------------------------------

export async function getAllAssignments(_req: Request, res: Response) {
  try {
    const assignments = await Assignment.find().sort({ createdAt: -1 });
    return res.json({ assignments });
  } catch (error: any) {
    console.error("getAllAssignments error:", error);
    return res.status(500).json({ error: "Failed to fetch assignments" });
  }
}

// ---------------------------------------------------------------------------
// GET /api/assignments/:id — Get single assignment
// ---------------------------------------------------------------------------

export async function getAssignment(req: Request, res: Response) {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }
    return res.json({ assignment });
  } catch (error: any) {
    console.error("getAssignment error:", error);
    return res.status(500).json({ error: "Failed to fetch assignment" });
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/assignments/:id — Delete an assignment
// ---------------------------------------------------------------------------

export async function deleteAssignment(req: Request, res: Response) {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }
    await Assignment.findByIdAndDelete(req.params.id);
    return res.json({ message: "Assignment deleted" });
  } catch (error: any) {
    console.error("deleteAssignment error:", error);
    return res.status(500).json({ error: "Failed to delete assignment" });
  }
}

// ---------------------------------------------------------------------------
// GET /api/assignments/:id/status — Get generation status
// ---------------------------------------------------------------------------

export async function getJobStatus(req: Request, res: Response) {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }
    return res.json({
      id: assignment._id,
      status: assignment.status,
      jobId: assignment.jobId,
      generatedPaper: assignment.status === "completed" ? assignment.generatedPaper : undefined,
      errorMessage: assignment.status === "failed" ? assignment.errorMessage : undefined,
    });
  } catch (error: any) {
    console.error("getJobStatus error:", error);
    return res.status(500).json({ error: "Failed to fetch status" });
  }
}
