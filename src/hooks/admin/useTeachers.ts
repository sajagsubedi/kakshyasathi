import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { adminRequest, asPaginated } from "@/hooks/admin/http";

export interface TeacherItem {
  _id: string;
  user: {
    _id: string;
    name: string;
    username: string;
    email?: string;
  };
  subjects: Array<{ _id: string; name: string; code: string }>;
  assignedSections: Array<{
    _id: string;
    name: string;
    class?: { _id: string; name: string };
  }>;
}

export function useAdminTeachers(limit = 100) {
  return useQuery({
    queryKey: ["admin", "teachers", { limit }],
    queryFn: async () => {
      const data = await adminRequest<unknown>(
        axios.get(`/api/admin/teachers?limit=${limit}&page=1`),
        "Failed to load teachers.",
      );
      return asPaginated<TeacherItem>(data);
    },
  });
}
