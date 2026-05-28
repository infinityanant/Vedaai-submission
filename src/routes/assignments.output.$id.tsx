import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download, Plus, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { getAssignment, type Assignment, type GeneratedPaper } from "@/lib/api";
import { subscribeToAssignment } from "@/lib/socket";

export const Route = createFileRoute("/assignments/output/$id")({
  head: () => ({
    meta: [
      { title: "Assignment Output — VedaAI" },
      { name: "description", content: "Generated assignment ready for review." },
    ],
  }),
  component: OutputPage,
});

function OutputPage() {
  const { id } = Route.useParams();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [paper, setPaper] = useState<GeneratedPaper | null>(null);
  const [status, setStatus] = useState<string>("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch assignment + subscribe to socket
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    async function load() {
      try {
        const a = await getAssignment(id);
        setAssignment(a);
        setStatus(a.status);

        if (a.status === "completed" && a.generatedPaper) {
          setPaper(a.generatedPaper);
        } else if (a.status === "failed") {
          setErrorMsg(a.errorMessage || "Generation failed");
        }

        // Subscribe to real-time updates if not yet completed
        if (a.status !== "completed" && a.status !== "failed") {
          unsubscribe = subscribeToAssignment(id, (data) => {
            setStatus(data.status);
            if (data.status === "completed" && data.paper) {
              setPaper(data.paper as GeneratedPaper);
            }
            if (data.status === "failed" && data.error) {
              setErrorMsg(data.error);
            }
          });
        }
      } catch (err: any) {
        setStatus("error");
        setErrorMsg(err.message || "Failed to load assignment");
      }
    }

    load();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [id]);

  // ------ Loading / Generating state ------
  if (status === "loading" || status === "queued" || status === "generating" || status === "pending") {
    return (
      <AppShell title="Create New">
        <div className="mx-auto max-w-3xl flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="relative">
            <div className="h-20 w-20 rounded-full border-4 border-muted" />
            <Loader2 className="absolute inset-0 m-auto h-10 w-10 animate-spin text-brand" />
          </div>
          <h2 className="mt-8 text-xl font-semibold">
            {status === "loading" ? "Loading..." : "Generating your question paper..."}
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            {status === "queued"
              ? "Your assignment is queued. It will start processing soon."
              : status === "generating"
                ? "Our AI is crafting your questions. This usually takes 15-30 seconds."
                : "Fetching assignment details..."}
          </p>
          <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Status: <span className="font-medium capitalize text-foreground">{status}</span>
          </div>
        </div>
      </AppShell>
    );
  }

  // ------ Error / Failed state ------
  if (status === "failed" || status === "error") {
    return (
      <AppShell title="Create New">
        <div className="mx-auto max-w-3xl flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="h-16 w-16 rounded-full bg-destructive/10 grid place-items-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="mt-6 text-xl font-semibold">Generation Failed</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            {errorMsg || "Something went wrong while generating your question paper."}
          </p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium hover:bg-accent"
            >
              <RefreshCw className="h-4 w-4" /> Retry
            </button>
            <Link
              to="/assignments/create"
              className="btn-ink inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium"
            >
              <Plus className="h-4 w-4" /> Create New
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  // ------ Completed state — render the paper ------
  if (!paper) {
    return (
      <AppShell title="Create New">
        <div className="mx-auto max-w-3xl text-center py-20">
          <p className="text-muted-foreground">No paper data available.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Create New">
      <div className="mx-auto max-w-3xl space-y-5">
        {/* Banner */}
        <div className="rounded-2xl btn-ink p-5 text-sm">
          <p>
            Your question paper has been generated successfully! Here is the structured output for{" "}
            <b>{paper.title}</b> — {paper.subject}.
          </p>
          <button className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-4 py-2 text-xs font-medium hover:bg-white/15">
            <Download className="h-3.5 w-3.5" /> Download as PDF
          </button>
        </div>

        {/* Paper */}
        <article className="card-soft p-6 md:p-10">
          <header className="text-center">
            <h2 className="font-serif text-2xl md:text-3xl">{paper.title}</h2>
            <p className="mt-1 text-sm">Subject: {paper.subject}</p>
          </header>

          <div className="mt-6 flex justify-between text-sm">
            <span>Duration: {paper.duration}</span>
            <span>Maximum Marks: {paper.totalMarks}</span>
          </div>

          <p className="mt-3 text-sm">All questions are compulsory unless stated otherwise.</p>

          {/* Sections */}
          {paper.sections.map((section, si) => (
            <div key={si} className="mt-8">
              <h3 className="text-center font-serif text-xl">{section.title}</h3>
              <p className="mt-2 font-semibold text-sm">{section.instruction}</p>

              <ol className="mt-3 space-y-4 text-sm list-decimal pl-5">
                {section.questions.map((q, qi) => (
                  <li key={qi}>
                    <span className="inline-block rounded bg-muted px-1.5 py-0.5 text-xs font-medium mr-1">
                      {q.difficulty}
                    </span>
                    {q.text}
                    <span className="ml-1 text-muted-foreground">[{q.marks} Marks]</span>

                    {q.options && q.options.length > 0 && (
                      <div className="mt-2 ml-2 grid grid-cols-1 sm:grid-cols-2 gap-1">
                        {q.options.map((opt, oi) => (
                          <span key={oi} className="text-muted-foreground">
                            {opt}
                          </span>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          ))}

          <p className="mt-8 text-sm font-semibold text-center">— End of Question Paper —</p>
        </article>

        <div className="flex justify-center pb-24 md:pb-6">
          <Link
            to="/assignments/create"
            className="btn-ink inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium shadow-xl"
          >
            <Plus className="h-4 w-4" /> Create Another
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
