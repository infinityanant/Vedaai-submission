import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/library")({
  head: () => ({ meta: [{ title: "My Library — VedaAI" }] }),
  component: () => (
    <AppShell title="My Library">
      <div className="card-soft p-10 text-center">
        <h1 className="font-serif text-3xl">My Library</h1>
        <p className="mt-2 text-sm text-muted-foreground">Coming soon.</p>
        <Link to="/assignments" className="mt-4 inline-block text-sm underline">Back to Assignments</Link>
      </div>
    </AppShell>
  ),
});
