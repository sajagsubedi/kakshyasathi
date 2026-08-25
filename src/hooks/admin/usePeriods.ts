import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { adminRequest } from "@/hooks/admin/http";

export interface PeriodItem {
  _id: string;
  academicYear: { _id: string; label: string; isActive?: boolean } | string;
  order: number;
  slotType: "period" | "break";
  periodNumber?: number;
  label?: string;
  startTime: string;
  endTime: string;
}

const KEY = ["admin", "periods"] as const;

export function useAdminPeriods(academicYear?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...KEY, { academicYear }],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (academicYear) searchParams.set("academicYear", academicYear);
      const data = await adminRequest<PeriodItem[]>(
        axios.get(`/api/admin/periods?${searchParams.toString()}`),
        "Failed to load periods.",
      );
      return Array.isArray(data) ? data : [];
    },
  });

  const createPeriod = useMutation({
    mutationFn: async (payload: {
      academicYear: string;
      order: number;
      slotType: "period" | "break";
      periodNumber?: number;
      label?: string;
      startTime: string;
      endTime: string;
    }) => {
      return adminRequest(axios.post("/api/admin/periods", payload), "Create failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
    },
  });

  const updatePeriod = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<{
        order: number;
        slotType: "period" | "break";
        periodNumber?: number;
        label?: string;
        startTime: string;
        endTime: string;
      }>;
    }) => {
      return adminRequest(
        axios.patch(`/api/admin/periods/${id}`, payload),
        "Update failed",
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
    },
  });

  const deletePeriod = useMutation({
    mutationFn: async (id: string) => {
      return adminRequest(axios.delete(`/api/admin/periods/${id}`), "Delete failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
    },
  });

  return { ...query, createPeriod, updatePeriod, deletePeriod };
}
