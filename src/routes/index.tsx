import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { ClipboardList, Users, Wand2, Library, Sparkles, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useAssignments } from "@/store/assignments";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Home — VedaAI" },
      { name: "description", content: "Your AI teaching workspace." },
    ],
  }),
  component: Home,
});

const tiles = [
  { to: "/assignments", label: "Assignments", desc: "Create & grade", icon: ClipboardList },
  { to: "/groups", label: "My Groups", desc: "Classes & students", icon: Users },
  { to: "/toolkit", label: "AI Toolkit", desc: "Lesson helpers", icon: Wand2 },
  { to: "/library", label: "My Library", desc: "Saved resources", icon: Library },
] as const;

function Home() {
  const count = useAssignments((s) => s.assignments.length);
  const fetchAll = useAssignments((s) => s.fetchAll);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <AppShell title="Home">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="card-soft p-6 md:p-8 relative overflow-hidden">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-20 blur-3xl"
               style={{ background: "var(--gradient-brand)" }} />
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Welcome back</p>
          </div>
          <h1 className="mt-1 font-serif text-3xl md:text-4xl">Good to see you, John</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl">
            Pick up where you left off, or start something new. You have{" "}
            <b className="text-foreground">{count}</b> assignment{count === 1 ? "" : "s"} in flight.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              to="/assignments/create"
              className="btn-brand inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium"
            >
              <Sparkles className="h-4 w-4" /> Create Assignment
            </Link>
            <Link
              to="/assignments"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-accent"
            >
              View Assignments <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tiles.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              className="card-soft p-4 hover:-translate-y-0.5 transition-transform"
            >
              <span className="inline-grid place-items-center h-9 w-9 rounded-lg bg-muted">
                <t.icon className="h-4 w-4" />
              </span>
              <div className="mt-3 text-sm font-semibold">{t.label}</div>
              <div className="text-xs text-muted-foreground">{t.desc}</div>
            </Link>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
