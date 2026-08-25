import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { adminRequest } from "@/hooks/admin/http";

export interface TeacherLeaveItem {
  _id: string;
  teacher: { _id: string; user: any } | string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  reviewedBy?: { _id: string; name: string; email: string } | string;
  createdAt?: string;
  updatedAt?: string;
}

const KEY = ["admin", "teacher-leaves"] as const;

export function useAdminTeacherLeaves(filters?: {
  teacher?: string;
  status?: "pending" | "approved" | "rejected";
}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...KEY, filters],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (filters?.teacher) searchParams.set("teacher", filters.teacher);
      if (filters?.status) searchParams.set("status", filters.status);
      const data = await adminRequest<TeacherLeaveItem[]>(
        axios.get(`/api/admin/teacher-leaves?${searchParams.toString()}`),
        "Failed to load teacher leaves.",
      );
      return Array.isArray(data) ? data : [];
    },
  });

  const createTeacherLeave = useMutation({
    mutationFn: async (payload: {
      teacher: string;
      fromDate: string;
      toDate: string;
      reason: string;
    }) => {
      return adminRequest(axios.post("/api/admin/teacher-leaves", payload), "Create failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
    },
  });

  const updateTeacherLeave = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<{
        fromDate: string;
        toDate: string;
        reason: string;
        status: "pending" | "approved" | "rejected";
        reviewedBy?: string;
      }>;
    }) => {
      return adminRequest(
        axios.patch(`/api/admin/teacher-leaves/${id}`, payload),
        "Update failed",
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
    },
  });

  const deleteTeacherLeave = useMutation({
    mutationFn: async (id: string) => {
      return adminRequest(axios.delete(`/api/admin/teacher-leaves/${id}`), "Delete failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
    },
  });

  const reviewTeacherLeave = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "approved" | "rejected";
    }) => {
      return adminRequest(
        axios.post(`/api/admin/teacher-leaves/${id}/review`, { status }),
        "Review failed",
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
    },
  });

  return { 
    ...query, 
    createTeacherLeave, 
    updateTeacherLeave, 
    deleteTeacherLeave,
    reviewTeacherLeave 
  };
}