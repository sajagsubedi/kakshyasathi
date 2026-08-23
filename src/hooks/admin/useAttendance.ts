import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { adminRequest, asPaginated } from "@/hooks/admin/http";

export function useAdminAttendance(
  params: {
    date?: string;
    section?: string;
    view?: "students" | "presence";
    page?: number;
    limit?: number;
  } = {},
) {
  const { date, section, view = "students", page = 1, limit = 20 } = params;

  return useQuery({
    queryKey: ["admin", "attendance", { date, section, view, page, limit }],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (date) searchParams.set("date", date);
      if (section) searchParams.set("section", section);
      searchParams.set("view", view);
      searchParams.set("page", String(page));
      searchParams.set("limit", String(limit));
      const data = await adminRequest<unknown>(
        axios.get(`/api/admin/attendance?${searchParams.toString()}`),
        "Failed to load attendance.",
      );
      return asPaginated<Record<string, unknown>>(data);
    },
  });
}
