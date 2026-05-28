import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutGrid, ClipboardList, Library, Wand2 } from "lucide-react";

const tabs = [
  { url: "/", label: "Home", icon: LayoutGrid },
  { url: "/assignments", label: "Assignments", icon: ClipboardList },
  { url: "/library", label: "Library", icon: Library },
  { url: "/toolkit", label: "AI Toolkit", icon: Wand2 },
];

export function MobileTabbar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  return (
    <nav className="md:hidden fixed bottom-3 left-3 right-3 z-40 rounded-2xl btn-ink shadow-2xl">
      <ul className="grid grid-cols-4">
        {tabs.map((t) => {
          const active = t.url === "/" ? pathname === "/" : pathname.startsWith(t.url);
          return (
            <li key={t.url}>
              <Link
                to={t.url}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] ${
                  active ? "text-white" : "text-white/50"
                }`}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
