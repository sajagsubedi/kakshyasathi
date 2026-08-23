// src/hooks/useAdminClasses.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ApiResponse } from "@/types/response";

export interface ClassItem {
  _id: string;
  name: string;
  grade: number;
  academicYear:
    | string
    | {
        _id: string;
        label: string;
      };
  createdAt?: string;
  updatedAt?: string;
}

// Optional: if your list endpoint returns pagination
export interface ClassesListResponse {
  items: ClassItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const CLASSES_KEY = ["admin", "classes"] as const;

type ClassesQueryParams = {
  academicYear?: string;
  search?: string;
  page?: number;
  limit?: number;
};

export function useAdminClasses(params: ClassesQueryParams = {}) {
  const queryClient = useQueryClient();

  const { academicYear, search, page = 1, limit = 20 } = params;

  // ---------- List ----------
  const classesQuery = useQuery({
    queryKey: [...CLASSES_KEY, { academicYear, search, page, limit }],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (academicYear) searchParams.set("academicYear", academicYear);
      if (search) searchParams.set("search", search);
      searchParams.set("page", String(page));
      searchParams.set("limit", String(limit));

      const res = await axios.get<ApiResponse>(
        `/api/admin/classes?${searchParams.toString()}`,
      );

      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to load classes.");
      }

      // Support both array and paginated response shapes
      const data = res.data.data;
      if (Array.isArray(data)) {
        return {
          items: data as ClassItem[],
          total: data.length,
          page: 1,
          limit: data.length,
          totalPages: 1,
        } satisfies ClassesListResponse;
      }

      return data as ClassesListResponse;
    },
  });

  // ---------- Create ----------
  const createClass = useMutation({
    mutationFn: async (payload: {
      name: string;
      grade: number;
      academicYear: string;
    }) => {
      const res = await axios.post<ApiResponse>("/api/admin/classes", payload);
      if (!res.data.success) {
        throw new Error(res.data.message || "Create failed");
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLASSES_KEY });
    },
  });

  // ---------- Update ----------
  const updateClass = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<{
        name: string;
        grade: number;
        academicYear: string;
      }>;
    }) => {
      const res = await axios.patch<ApiResponse>(
        `/api/admin/classes/${id}`,
        payload,
      );
      if (!res.data.success) {
        throw new Error(res.data.message || "Update failed");
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLASSES_KEY });
    },
  });

  // ---------- Delete ----------
  const deleteClass = useMutation({
    mutationFn: async (id: string) => {
      const res = await axios.delete<ApiResponse>(`/api/admin/classes/${id}`);
      if (!res.data.success) {
        throw new Error(res.data.message || "Delete failed");
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLASSES_KEY });
    },
  });

  return {
    ...classesQuery, // data, isLoading, isError, error, refetch, etc.
    createClass,
    updateClass,
    deleteClass,
  };
}
