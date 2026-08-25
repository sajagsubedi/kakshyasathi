import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { adminRequest } from "@/hooks/admin/http";

export interface HolidayItem {
  _id: string;
  academicYear: { _id: string; label: string; isActive?: boolean } | string;
  date: string;
  title: string;
  type: "holiday" | "workingDay";
  createdAt?: string;
  updatedAt?: string;
}

const KEY = ["admin", "holidays"] as const;

export function useAdminHolidays(academicYear?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...KEY, { academicYear }],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (academicYear) searchParams.set("academicYear", academicYear);
      const data = await adminRequest<HolidayItem[]>(
        axios.get(`/api/admin/holidays?${searchParams.toString()}`),
        "Failed to load holidays.",
      );
      return Array.isArray(data) ? data : [];
    },
  });

  const createHoliday = useMutation({
    mutationFn: async (payload: {
      academicYear: string;
      date: string;
      title: string;
      type?: "holiday" | "workingDay";
    }) => {
      return adminRequest(axios.post("/api/admin/holidays", payload), "Create failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
    },
  });

  const updateHoliday = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<{
        date: string;
        title: string;
        type: "holiday" | "workingDay";
      }>;
    }) => {
      return adminRequest(
        axios.patch(`/api/admin/holidays/${id}`, payload),
        "Update failed",
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
    },
  });

  const deleteHoliday = useMutation({
    mutationFn: async (id: string) => {
      return adminRequest(axios.delete(`/api/admin/holidays/${id}`), "Delete failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
    },
  });

  return { ...query, createHoliday, updateHoliday, deleteHoliday };
}