import { Bell, ChevronDown, ArrowLeft } from "lucide-react";
import { Link, useRouter } from "@tanstack/react-router";
import avatar from "@/assets/school-avatar.png";
import { useAssignments } from "@/store/assignments";

export function Topbar({ title }: { title: string }) {
  const router = useRouter();
  const wsConnected = useAssignments((s) => s.wsConnected);
  return (
    <header className="flex items-center gap-3 border-b border-border bg-card/60 backdrop-blur px-4 md:px-6 h-16">
      <button
        onClick={() => router.history.back()}
        className="hidden md:inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-accent"
        aria-label="Back"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>
      <Link to="/assignments" className="text-sm text-muted-foreground hover:text-foreground">
        {title}
      </Link>
      <div className="ml-auto flex items-center gap-3">
        <span
          className={`hidden sm:inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
            wsConnected
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-amber-200 bg-amber-50 text-amber-700"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${wsConnected ? "bg-emerald-500" : "bg-amber-500"}`} />
          {wsConnected ? "Live" : "Connecting…"}
        </span>
        <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-accent">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-brand" />
        </button>
        <button className="flex items-center gap-2 rounded-full border border-border bg-card pl-1 pr-3 py-1">
          <img src={avatar} alt="" width={28} height={28} className="h-7 w-7 rounded-full object-cover" />
          <span className="text-sm font-medium">John Doe</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}
