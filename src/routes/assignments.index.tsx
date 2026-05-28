import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Filter, Search, Plus, MoreVertical, Eye, Trash2, Loader2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useAssignments } from "@/store/assignments";
import emptyImg from "@/assets/empty-assignments.png";

export const Route = createFileRoute("/assignments/")({
  component: AssignmentsPage,
});

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  queued: "bg-blue-100 text-blue-800",
  generating: "bg-purple-100 text-purple-800",
  completed: "bg-emerald-100 text-emerald-800",
  failed: "bg-red-100 text-red-800",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${STATUS_STYLES[status] || "bg-muted text-muted-foreground"}`}
    >
      {status}
    </span>
  );
}

function AssignmentsPage() {
  const { assignments, loading, fetchAll, removeAssignment } = useAssignments();
  const [query, setQuery] = useState("");
  const [menuId, setMenuId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch from backend on mount
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    const close = () => setMenuId(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  const filtered = assignments.filter((a) =>
    a.title.toLowerCase().includes(query.toLowerCase()),
  );

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setMenuId(null);
    try {
      await removeAssignment(id);
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const p = (n: number) => String(n).padStart(2, "0");
      return `${p(d.getDate())}-${p(d.getMonth() + 1)}-${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  if (loading && assignments.length === 0) {
    return (
      <AppShell title="Assignment">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Assignment">
      {assignments.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex h-[calc(100vh-7rem)] flex-col gap-4">
          <div className="card-soft p-5 md:p-6">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Assignments</h1>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage and create assignments for your classes.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <button className="card-soft inline-flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground">
              <Filter className="h-4 w-4" /> Filter By
            </button>
            <div className="card-soft flex flex-1 items-center gap-2 px-4 py-2.5">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Assignment"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-24">
            {filtered.map((a) => (
              <article
                key={a._id}
                className={`card-soft relative p-5 group ${deletingId === a._id ? "opacity-50" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-xl underline underline-offset-4 decoration-foreground/40 truncate">
                      {a.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">{a.subject}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={a.status} />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuId(menuId === a._id ? null : a._id);
                      }}
                      className="h-8 w-8 grid place-items-center rounded-full hover:bg-accent"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>

                  {menuId === a._id && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-4 top-12 z-10 w-44 card-soft p-1.5 text-sm"
                    >
                      <Link
                        to="/assignments/output/$id"
                        params={{ id: a._id }}
                        className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-accent"
                      >
                        <Eye className="h-4 w-4" /> View Assignment
                      </Link>
                      <button
                        onClick={() => handleDelete(a._id)}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </div>
                  )}
                </div>
                <div className="mt-8 flex items-center justify-between text-sm">
                  <span><b className="font-semibold">Created</b> : {formatDate(a.createdAt)}</span>
                  <span><b className="font-semibold">Due</b> : {formatDate(a.dueDate)}</span>
                </div>
              </article>
            ))}
          </div>

          <div className="pointer-events-none fixed bottom-20 md:bottom-6 left-0 right-0 flex justify-center md:justify-end md:pr-10">
            <Link
              to="/assignments/create"
              className="pointer-events-auto btn-ink inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium shadow-2xl hover:opacity-95"
            >
              <Plus className="h-4 w-4" /> Create Assignment
            </Link>
          </div>
        </div>
      )}
    </AppShell>
  );

  function EmptyState() {
    return (
      <div className="card-soft min-h-[calc(100vh-9rem)] flex flex-col items-center justify-center text-center px-6 py-12">
        <img
          src={emptyImg}
          alt=""
          width={220}
          height={220}
          loading="lazy"
          className="h-48 w-48 md:h-56 md:w-56 object-contain"
        />
        <h2 className="mt-6 text-lg md:text-xl font-semibold">No assignments yet</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Create your first assignment to start collecting and grading student submissions. You can
          set up rubrics, define marking criteria, and let AI assist with grading.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-2">
          <Link
            to="/assignments/create"
            className="btn-ink inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium"
          >
            <Plus className="h-4 w-4" /> Create Your First Assignment
          </Link>
        </div>
      </div>
    );
  }
}
