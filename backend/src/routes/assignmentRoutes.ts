import { Router } from "express";
import {
  createAssignment,
  getAllAssignments,
  getAssignment,
  deleteAssignment,
  getJobStatus,
} from "../controllers/assignmentController";

const router = Router();

router.get("/", getAllAssignments);
router.post("/", createAssignment);
router.get("/:id", getAssignment);
router.delete("/:id", deleteAssignment);
router.get("/:id/status", getJobStatus);

export default router;
