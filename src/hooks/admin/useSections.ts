// src/hooks/useAdminSections.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ApiResponse } from "@/types/response";

export interface ClassRef {
  _id: string;
  name: string;
  grade?: number;
  academicYear?: {
    label: string;
    _id: string;
  };
}

export interface SectionItem {
  _id: string;
  name: string;
  class: ClassRef | string; // populated or just ObjectId
  createdAt?: string;
  updatedAt?: string;
}

export interface SectionsListResponse {
  items: SectionItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const SECTIONS_KEY = ["admin", "sections"] as const;

type SectionsQueryParams = {
  classId?: string; // filter by class
  search?: string;
  page?: number;
  limit?: number;
};

export function useAdminSections(params: SectionsQueryParams = {}) {
  const queryClient = useQueryClient();

  const { classId, search, page = 1, limit = 20 } = params;

  // ---------- List ----------
  const sectionsQuery = useQuery({
    queryKey: [...SECTIONS_KEY, { classId, search, page, limit }],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (classId) searchParams.set("class", classId);
      if (search) searchParams.set("search", search);
      searchParams.set("page", String(page));
      searchParams.set("limit", String(limit));

      const res = await axios.get<ApiResponse>(
        `/api/admin/sections?${searchParams.toString()}`,
      );

      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to load sections.");
      }

      const data = res.data.data;

      // Support both array and paginated response
      if (Array.isArray(data)) {
        return {
          items: data as SectionItem[],
          total: data.length,
          page: 1,
          limit: data.length,
          totalPages: 1,
        } satisfies SectionsListResponse;
      }

      return data as SectionsListResponse;
    },
  });

  // ---------- Create ----------
  const createSection = useMutation({
    mutationFn: async (payload: { class: string; name: string }) => {
      const res = await axios.post<ApiResponse>("/api/admin/sections", payload);
      if (!res.data.success) {
        throw new Error(res.data.message || "Create failed");
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SECTIONS_KEY });
    },
  });

  // ---------- Update ----------
  const updateSection = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<{ name: string }>;
    }) => {
      const res = await axios.patch<ApiResponse>(
        `/api/admin/sections/${id}`,
        payload,
      );
      if (!res.data.success) {
        throw new Error(res.data.message || "Update failed");
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SECTIONS_KEY });
    },
  });

  // ---------- Delete ----------
  const deleteSection = useMutation({
    mutationFn: async (id: string) => {
      const res = await axios.delete<ApiResponse>(`/api/admin/sections/${id}`);
      if (!res.data.success) {
        throw new Error(res.data.message || "Delete failed");
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SECTIONS_KEY });
    },
  });

  return {
    ...sectionsQuery,
    createSection,
    updateSection,
    deleteSection,
  };
}
