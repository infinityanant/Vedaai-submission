import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutGrid,
  Users,
  ClipboardList,
  Wand2,
  Library,
  Settings,
  Sparkles,
} from "lucide-react";
import logo from "@/assets/veda-logo.png";
import avatar from "@/assets/school-avatar.png";
import { useAssignments } from "@/store/assignments";

const items = [
  { title: "Home", url: "/", icon: LayoutGrid },
  { title: "My Groups", url: "/groups", icon: Users },
  { title: "Assignments", url: "/assignments", icon: ClipboardList, badgeFromAssignments: true },
  { title: "AI Teacher's Toolkit", url: "/toolkit", icon: Wand2 },
  { title: "My Library", url: "/library", icon: Library },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const count = useAssignments((s) => s.assignments.length);

  return (
    <aside className="hidden md:flex w-[260px] shrink-0 flex-col bg-sidebar border-r border-sidebar-border p-4 gap-4">
      <div className="flex items-center gap-2 px-2 py-1">
        <img src={logo} alt="VedaAI" width={32} height={32} className="rounded-md" />
        <span className="font-serif text-2xl leading-none tracking-tight">VedaAI</span>
      </div>

      <Link
        to="/assignments/create"
        className="btn-brand inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-transform hover:scale-[1.01] active:scale-[0.99]"
      >
        <Sparkles className="h-4 w-4" />
        Create Assignment
      </Link>

      <nav className="mt-2 flex flex-col gap-1">
        {items.map((it) => {
          const active = it.url === "/" ? pathname === "/" : pathname.startsWith(it.url);
          return (
            <Link
              key={it.url}
              to={it.url}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              }`}
            >
              <it.icon className="h-4 w-4" />
              <span className="flex-1">{it.title}</span>
              {it.badgeFromAssignments && count > 0 && (
                <span className="rounded-full bg-brand px-2 py-0.5 text-[11px] font-medium text-brand-foreground">
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent/60"
        >
          <Settings className="h-4 w-4" /> Settings
        </Link>
        <div className="flex items-center gap-3 rounded-xl border border-sidebar-border bg-card p-2.5">
          <img src={avatar} alt="" width={36} height={36} className="h-9 w-9 rounded-full object-cover" />
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">Delhi Public School</div>
            <div className="truncate text-xs text-muted-foreground">Bokaro Steel City</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
