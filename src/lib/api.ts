// ---------------------------------------------------------------------------
// REST API client for VedaAI backend
// ---------------------------------------------------------------------------

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface QuestionType {
  type: string;
  count: number;
  marksEach: number;
}

export interface CreateAssignmentPayload {
  title: string;
  subject: string;
  dueDate: string;
  instructions?: string;
  questionTypes: QuestionType[];
}

export interface GeneratedQuestion {
  text: string;
  difficulty: "Easy" | "Medium" | "Hard";
  marks: number;
  options?: string[];
}

export interface GeneratedSection {
  title: string;
  instruction: string;
  questions: GeneratedQuestion[];
}

export interface GeneratedPaper {
  title: string;
  subject: string;
  totalMarks: number;
  duration: string;
  sections: GeneratedSection[];
}

export interface Assignment {
  _id: string;
  title: string;
  subject: string;
  dueDate: string;
  instructions?: string;
  questionTypes: QuestionType[];
  totalMarks: number;
  status: "pending" | "queued" | "generating" | "completed" | "failed";
  jobId?: string;
  generatedPaper?: GeneratedPaper;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StatusResponse {
  id: string;
  status: Assignment["status"];
  jobId?: string;
  generatedPaper?: GeneratedPaper;
  errorMessage?: string;
}

// ---------------------------------------------------------------------------
// Question type mapping: frontend labels → backend enum values
// ---------------------------------------------------------------------------

const QUESTION_TYPE_MAP: Record<string, string> = {
  "Multiple Choice Questions": "mcq",
  "Short Questions": "short_answer",
  "Long Answer Questions": "long_answer",
  "Diagram/Graph-Based Questions": "diagram",
  "Numerical Problems": "numerical",
  "True/False": "true_false",
};

export function mapQuestionType(frontendLabel: string): string {
  return QUESTION_TYPE_MAP[frontendLabel] || frontendLabel;
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || body.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function createAssignment(
  data: CreateAssignmentPayload
): Promise<{ assignment: Assignment; jobId: string }> {
  return apiFetch("/api/assignments", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getAllAssignments(): Promise<Assignment[]> {
  const res = await apiFetch<{ assignments: Assignment[] }>("/api/assignments");
  return res.assignments;
}

export async function getAssignment(id: string): Promise<Assignment> {
  const res = await apiFetch<{ assignment: Assignment }>(`/api/assignments/${id}`);
  return res.assignment;
}

export async function deleteAssignment(id: string): Promise<void> {
  await apiFetch(`/api/assignments/${id}`, { method: "DELETE" });
}

export async function getAssignmentStatus(id: string): Promise<StatusResponse> {
  return apiFetch(`/api/assignments/${id}/status`);
}
