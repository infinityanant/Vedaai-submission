import { create } from "zustand";
import {
  getAllAssignments as fetchAllApi,
  createAssignment as createApi,
  deleteAssignment as deleteApi,
  type Assignment as ApiAssignment,
  type CreateAssignmentPayload,
  type GeneratedPaper,
} from "@/lib/api";

export type Assignment = {
  _id: string;
  title: string;
  subject: string;
  dueDate: string;
  instructions?: string;
  totalMarks: number;
  status: "pending" | "queued" | "generating" | "completed" | "failed";
  generatedPaper?: GeneratedPaper;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
};

type State = {
  assignments: Assignment[];
  loading: boolean;
  wsConnected: boolean;

  // Actions
  fetchAll: () => Promise<void>;
  createAssignment: (data: CreateAssignmentPayload) => Promise<Assignment>;
  removeAssignment: (id: string) => Promise<void>;
  updateAssignmentStatus: (
    id: string,
    status: Assignment["status"],
    extra?: { generatedPaper?: GeneratedPaper; errorMessage?: string }
  ) => void;
  setWsConnected: (v: boolean) => void;
};

function mapApiAssignment(a: ApiAssignment): Assignment {
  return {
    _id: a._id,
    title: a.title,
    subject: a.subject,
    dueDate: a.dueDate,
    instructions: a.instructions,
    totalMarks: a.totalMarks,
    status: a.status,
    generatedPaper: a.generatedPaper,
    errorMessage: a.errorMessage,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  };
}

export const useAssignments = create<State>((set) => ({
  assignments: [],
  loading: false,
  wsConnected: false,

  fetchAll: async () => {
    set({ loading: true });
    try {
      const data = await fetchAllApi();
      set({ assignments: data.map(mapApiAssignment), loading: false });
    } catch (err) {
      console.error("Failed to fetch assignments:", err);
      set({ loading: false });
    }
  },

  createAssignment: async (payload) => {
    const { assignment } = await createApi(payload);
    const mapped = mapApiAssignment(assignment);
    set((s) => ({ assignments: [mapped, ...s.assignments] }));
    return mapped;
  },

  removeAssignment: async (id) => {
    await deleteApi(id);
    set((s) => ({ assignments: s.assignments.filter((a) => a._id !== id) }));
  },

  updateAssignmentStatus: (id, status, extra) => {
    set((s) => ({
      assignments: s.assignments.map((a) =>
        a._id === id
          ? {
              ...a,
              status,
              ...(extra?.generatedPaper ? { generatedPaper: extra.generatedPaper } : {}),
              ...(extra?.errorMessage ? { errorMessage: extra.errorMessage } : {}),
            }
          : a
      ),
    }));
  },

  setWsConnected: (v) => set({ wsConnected: v }),
}));
