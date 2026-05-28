import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Filter, Search, Plus, MoreVertical, Eye, Trash2, Loader2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useAssignments } from "@/store/assignments";
import emptyImg from "@/assets/empty-assignments.png";

export const Route = createFileRoute("/assignments")({
  head: () => ({
    meta: [
      { title: "Assignments — VedaAI" },
      { name: "description", content: "Manage and create assignments for your classes." },
    ],
  }),
  component: AssignmentsLayout,
});

// This is a LAYOUT route — it renders child routes via <Outlet />.
// When no child matches (i.e. /assignments exactly), we show the list.
function AssignmentsLayout() {
  return <Outlet />;
}
