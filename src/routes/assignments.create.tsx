import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Calendar, Loader2, Mic, Plus, UploadCloud, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useAssignments } from "@/store/assignments";
import { mapQuestionType } from "@/lib/api";

export const Route = createFileRoute("/assignments/create")({
  head: () => ({
    meta: [
      { title: "Create Assignment — VedaAI" },
      { name: "description", content: "Set up a new assignment for your students." },
    ],
  }),
  component: CreateAssignment,
});

type Row = { id: string; type: string; count: number; marks: number };

const QUESTION_TYPES = [
  "Multiple Choice Questions",
  "Short Questions",
  "Diagram/Graph-Based Questions",
  "Numerical Problems",
  "Long Answer Questions",
];

function CreateAssignment() {
  const navigate = useNavigate();
  const createAssignment = useAssignments((s) => s.createAssignment);

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [instructions, setInstructions] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [rows, setRows] = useState<Row[]>([
    { id: "1", type: "Multiple Choice Questions", count: 4, marks: 1 },
    { id: "2", type: "Short Questions", count: 3, marks: 2 },
    { id: "3", type: "Diagram/Graph-Based Questions", count: 5, marks: 5 },
    { id: "4", type: "Numerical Problems", count: 5, marks: 5 },
  ]);
  const totalQ = rows.reduce((s, r) => s + r.count, 0);
  const totalM = rows.reduce((s, r) => s + r.count * r.marks, 0);

  const update = (id: string, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const submit = async () => {
    if (!title.trim() || !subject.trim()) {
      setError("Title and Subject are required");
      return;
    }
    if (rows.length === 0) {
      setError("Add at least one question type");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const assignment = await createAssignment({
        title: title.trim(),
        subject: subject.trim(),
        dueDate: dueDate || new Date().toISOString(),
        instructions: instructions.trim() || undefined,
        questionTypes: rows.map((r) => ({
          type: mapQuestionType(r.type),
          count: r.count,
          marksEach: r.marks,
        })),
      });
      navigate({ to: "/assignments/output/$id", params: { id: assignment._id } });
    } catch (err: any) {
      setError(err.message || "Failed to create assignment");
      setSubmitting(false);
    }
  };

  return (
    <AppShell title="Assignment">
      <div className="mx-auto max-w-3xl">
        <div className="mb-2 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Create Assignment</h1>
        </div>
        <p className="text-sm text-muted-foreground">Set up a new assignment for your students.</p>

        <div className="mt-4 h-1 w-full rounded-full bg-muted overflow-hidden">
          <div className="h-full w-1/3 btn-brand" />
        </div>

        <section className="card-soft mt-6 p-5 md:p-7 space-y-6">
          <header>
            <h2 className="text-lg font-semibold">Assignment Details</h2>
            <p className="text-sm text-muted-foreground">Basic information about your assignment</p>
          </header>

          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="text-sm font-medium">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Quiz on Electricity"
              className="mt-1.5 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-brand/30"
            />
          </div>

          {/* Subject */}
          <div>
            <label className="text-sm font-medium">Subject *</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Science, Math, English"
              className="mt-1.5 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-brand/30"
            />
          </div>

          {/* File upload area (kept for visual consistency) */}
          <div className="rounded-xl border-2 border-dashed border-border bg-muted/40 p-8 text-center">
            <div className="mx-auto h-10 w-10 rounded-full bg-card grid place-items-center border border-border">
              <UploadCloud className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm font-medium">Choose a file or drag & drop it here</p>
            <p className="text-xs text-muted-foreground">JPEG, PNG, upto 10MB</p>
            <button className="mt-4 rounded-full border border-border bg-card px-4 py-2 text-xs font-medium hover:bg-accent">
              Browse Files
            </button>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Upload images of your preferred document/image
          </p>

          {/* Due date */}
          <div>
            <label className="text-sm font-medium">Due Date</label>
            <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5">
              <input
                type="text"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder="DD-MM-YYYY"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Question types */}
          <div>
            <div className="grid grid-cols-[1fr_auto] md:grid-cols-[1fr_140px_140px_auto] gap-3 items-end mb-2">
              <span className="text-sm font-medium">Question Type</span>
              <span className="hidden md:block text-center text-xs text-muted-foreground">No. of Questions</span>
              <span className="hidden md:block text-center text-xs text-muted-foreground">Marks</span>
              <span />
            </div>
            <div className="space-y-3">
              {rows.map((r) => (
                <div
                  key={r.id}
                  className="grid grid-cols-1 md:grid-cols-[1fr_140px_140px_auto] gap-3 items-center"
                >
                  <select
                    value={r.type}
                    onChange={(e) => update(r.id, { type: e.target.value })}
                    className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none"
                  >
                    {QUESTION_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                  <Stepper
                    label="No. of Questions"
                    value={r.count}
                    onChange={(v) => update(r.id, { count: v })}
                  />
                  <Stepper label="Marks" value={r.marks} onChange={(v) => update(r.id, { marks: v })} />
                  <button
                    onClick={() => setRows((rs) => rs.filter((x) => x.id !== r.id))}
                    className="h-9 w-9 grid place-items-center rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive justify-self-end"
                    aria-label="Remove row"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() =>
                setRows((rs) => [
                  ...rs,
                  { id: crypto.randomUUID(), type: QUESTION_TYPES[0], count: 1, marks: 1 },
                ])
              }
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium hover:text-brand"
            >
              <span className="h-7 w-7 grid place-items-center rounded-full btn-ink">
                <Plus className="h-3.5 w-3.5" />
              </span>
              Add Question Type
            </button>

            <div className="mt-4 text-right text-sm">
              <div>Total Questions : <b>{totalQ}</b></div>
              <div>Total Marks : <b>{totalM}</b></div>
            </div>
          </div>

          {/* Additional instructions */}
          <div>
            <label className="text-sm font-medium">Additional Information (For better output)</label>
            <div className="mt-1.5 flex items-start gap-2 rounded-xl border border-border bg-card px-3 py-2.5">
              <textarea
                rows={2}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g Generate a question paper for 3 hour exam duration..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground resize-none"
              />
              <button className="h-8 w-8 grid place-items-center rounded-full hover:bg-accent">
                <Mic className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </section>

        <div className="mt-6 flex items-center justify-between">
          <Link
            to="/assignments"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" /> Previous
          </Link>
          <button
            onClick={submit}
            disabled={submitting}
            className="btn-ink inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Creating…
              </>
            ) : (
              <>
                Next <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </AppShell>
  );
}

function Stepper({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-full border border-border bg-card px-1 py-1">
      <button
        aria-label={`Decrease ${label}`}
        onClick={() => onChange(Math.max(0, value - 1))}
        className="h-7 w-7 grid place-items-center rounded-full hover:bg-accent"
      >
        −
      </button>
      <span className="text-sm font-medium tabular-nums">{value}</span>
      <button
        aria-label={`Increase ${label}`}
        onClick={() => onChange(value + 1)}
        className="h-7 w-7 grid place-items-center rounded-full hover:bg-accent"
      >
        +
      </button>
    </div>
  );
}
