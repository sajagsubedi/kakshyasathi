import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { adminRequest, asPaginated } from "@/hooks/admin/http";

export interface SubstitutionItem {
  _id: string;
  section: { _id: string; name: string; class?: { name: string } } | string;
  periodNumber: number;
  date: string;
  originalTeacher:
    | { _id: string; user?: { name: string } }
    | string;
  substituteTeacher:
    | { _id: string; user?: { name: string } }
    | string;
}

const KEY = ["admin", "substitutions"] as const;

export function useAdminSubstitutions(params: {
  date?: string;
  section?: string;
  page?: number;
  limit?: number;
} = {}) {
  const queryClient = useQueryClient();
  const { date, section, page = 1, limit = 20 } = params;

  const query = useQuery({
    queryKey: [...KEY, { date, section, page, limit }],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (date) searchParams.set("date", date);
      if (section) searchParams.set("section", section);
      searchParams.set("page", String(page));
      searchParams.set("limit", String(limit));
      const data = await adminRequest<unknown>(
        axios.get(`/api/admin/substitutions?${searchParams.toString()}`),
        "Failed to load substitutions.",
      );
      return asPaginated<SubstitutionItem>(data);
    },
  });

  const createSubstitution = useMutation({
    mutationFn: async (payload: {
      section: string;
      periodNumber: number;
      date: string;
      originalTeacher: string;
      substituteTeacher: string;
    }) => {
      return adminRequest(
        axios.post("/api/admin/substitutions", payload),
        "Create failed",
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
    },
  });

  const deleteSubstitution = useMutation({
    mutationFn: async (id: string) => {
      return adminRequest(
        axios.delete(`/api/admin/substitutions/${id}`),
        "Delete failed",
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
    },
  });

  return { ...query, createSubstitution, deleteSubstitution };
}
