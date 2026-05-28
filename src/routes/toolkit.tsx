import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/toolkit")({
  head: () => ({ meta: [{ title: "AI Teacher's Toolkit — VedaAI" }] }),
  component: () => (
    <AppShell title="AI Teacher's Toolkit">
      <div className="card-soft p-10 text-center">
        <h1 className="font-serif text-3xl">AI Teacher's Toolkit</h1>
        <p className="mt-2 text-sm text-muted-foreground">Coming soon.</p>
        <Link to="/assignments" className="mt-4 inline-block text-sm underline">Back to Assignments</Link>
      </div>
    </AppShell>
  ),
});
