import type { ReactNode } from "react";
import { AppSidebar } from "./app-sidebar";
import { Topbar } from "./topbar";
import { MobileTabbar } from "./mobile-tabbar";
import { useAssignmentsWS } from "@/hooks/use-assignments-ws";

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  useAssignmentsWS();
  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={title} />
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6">{children}</main>
      </div>
      <MobileTabbar />
    </div>
  );
}
