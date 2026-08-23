import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { adminRequest } from "@/hooks/admin/http";
import { DayOfWeek } from "@/types";

export interface TimetableEntry {
  _id: string;
  section: { _id: string; name: string; class?: { name: string } } | string;
  dayOfWeek: DayOfWeek;
  periodNumber: number;
  subject: { _id: string; name: string; code: string } | string;
  teacher:
    | {
        _id: string;
        user?: { name: string; username: string };
      }
    | string;
  classroom: { _id: string; roomNumber: string } | string;
  customStartTime?: string;
  customEndTime?: string;
}

const KEY = ["admin", "timetable"] as const;

export function useAdminTimetable(section?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...KEY, { section }],
    enabled: Boolean(section),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (section) searchParams.set("section", section);
      const data = await adminRequest<TimetableEntry[]>(
        axios.get(`/api/admin/timetable?${searchParams.toString()}`),
        "Failed to load timetable.",
      );
      return Array.isArray(data) ? data : [];
    },
  });

  const createEntry = useMutation({
    mutationFn: async (payload: {
      section: string;
      dayOfWeek: DayOfWeek;
      periodNumber: number;
      subject: string;
      teacher: string;
      classroom: string;
      customStartTime?: string;
      customEndTime?: string;
    }) => {
      return adminRequest(
        axios.post("/api/admin/timetable", payload),
        "Create failed",
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
    },
  });

  const updateEntry = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<{
        dayOfWeek: DayOfWeek;
        periodNumber: number;
        subject: string;
        teacher: string;
        classroom: string;
        customStartTime: string | null;
        customEndTime: string | null;
      }>;
    }) => {
      return adminRequest(
        axios.patch(`/api/admin/timetable/${id}`, payload),
        "Update failed",
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
    },
  });

  const deleteEntry = useMutation({
    mutationFn: async (id: string) => {
      return adminRequest(
        axios.delete(`/api/admin/timetable/${id}`),
        "Delete failed",
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
    },
  });

  return { ...query, createEntry, updateEntry, deleteEntry };
}
