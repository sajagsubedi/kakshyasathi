import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ApiResponse } from "@/types/response";

export interface AcademicYear {
  _id: string;
  label: string;
  startDate: string; // or Date
  endDate: string; // or Date
  isActive: boolean;
  weeklyOffDays?: string[];
  createdAt?: string;
  updatedAt?: string;
}

const ACADEMIC_YEARS_KEY = ["admin", "academic-years"] as const;

export function useAdminAcademicYears() {
  const queryClient = useQueryClient();

  // ---------- List ----------
  const academicYearsQuery = useQuery({
    queryKey: ACADEMIC_YEARS_KEY,
    queryFn: async () => {
      const res = await axios.get<ApiResponse>("/api/admin/academic-years");
      if (!res.data.success || !Array.isArray(res.data.data)) {
        throw new Error(res.data.message || "Failed to load academic years.");
      }
      return res.data.data as AcademicYear[];
    },
  });

  // ---------- Create ----------
  const createAcademicYear = useMutation({
    mutationFn: async (payload: {
      label: string;
      startDate: string;
      endDate: string;
      weeklyOffDays?: string[];
    }) => {
      const res = await axios.post<ApiResponse>(
        "/api/admin/academic-years",
        payload,
      );
      if (!res.data.success) {
        throw new Error(res.data.message || "Create failed");
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACADEMIC_YEARS_KEY });
    },
  });

  // ---------- Update ----------
  const updateAcademicYear = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<{
        label: string;
        startDate: string;
        endDate: string;
        weeklyOffDays?: string[];
      }>;
    }) => {
      const res = await axios.patch<ApiResponse>(
        `/api/admin/academic-years/${id}`,
        payload,
      );
      if (!res.data.success) {
        throw new Error(res.data.message || "Update failed");
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACADEMIC_YEARS_KEY });
    },
  });

  // ---------- Delete ----------
  const deleteAcademicYear = useMutation({
    mutationFn: async (id: string) => {
      const res = await axios.delete<ApiResponse>(
        `/api/admin/academic-years/${id}`,
      );
      if (!res.data.success) {
        throw new Error(res.data.message || "Delete failed");
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACADEMIC_YEARS_KEY });
    },
  });

  // ---------- Activate ----------
  const activateAcademicYear = useMutation({
    mutationFn: async (id: string) => {
      const res = await axios.patch<ApiResponse>(
        `/api/admin/academic-years/${id}/activate`,
      );
      if (!res.data.success) {
        throw new Error(res.data.message || "Activate failed");
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACADEMIC_YEARS_KEY });
    },
  });

  return {
    ...academicYearsQuery, // data, isLoading, isError, error, refetch, etc.
    createAcademicYear,
    updateAcademicYear,
    deleteAcademicYear,
    activateAcademicYear,
  };
}
