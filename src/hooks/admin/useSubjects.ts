import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { adminRequest, asPaginated, type Paginated } from "@/hooks/admin/http";

export interface SubjectItem {
  _id: string;
  name: string;
  code: string;
  createdAt?: string;
  updatedAt?: string;
}

const SUBJECTS_KEY = ["admin", "subjects"] as const;

type SubjectsQueryParams = {
  search?: string;
  page?: number;
  limit?: number;
};

export function useAdminSubjects(params: SubjectsQueryParams = {}) {
  const queryClient = useQueryClient();
  const { search, page = 1, limit = 20 } = params;

  const subjectsQuery = useQuery({
    queryKey: [...SUBJECTS_KEY, { search, page, limit }],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (search) searchParams.set("search", search);
      searchParams.set("page", String(page));
      searchParams.set("limit", String(limit));

      const data = await adminRequest<unknown>(
        axios.get(`/api/admin/subjects?${searchParams.toString()}`),
        "Failed to load subjects.",
      );
      return asPaginated<SubjectItem>(data);
    },
  });

  const createSubject = useMutation({
    mutationFn: async (payload: { name: string; code: string }) => {
      return adminRequest(
        axios.post("/api/admin/subjects", payload),
        "Create failed",
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBJECTS_KEY });
    },
  });

  const updateSubject = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<{ name: string; code: string }>;
    }) => {
      return adminRequest(
        axios.patch(`/api/admin/subjects/${id}`, payload),
        "Update failed",
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBJECTS_KEY });
    },
  });

  const deleteSubject = useMutation({
    mutationFn: async (id: string) => {
      return adminRequest(
        axios.delete(`/api/admin/subjects/${id}`),
        "Delete failed",
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBJECTS_KEY });
    },
  });

  return {
    ...subjectsQuery,
    createSubject,
    updateSubject,
    deleteSubject,
  };
}

export type { Paginated };
