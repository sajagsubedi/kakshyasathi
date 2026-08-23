import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { adminRequest, asPaginated } from "@/hooks/admin/http";
import { NoticeTargetType } from "@/types";

export interface NoticeItem {
  _id: string;
  title: string;
  body: string;
  author?: { _id: string; name: string; username?: string } | string;
  targetType: NoticeTargetType;
  targetSections: Array<{ _id: string; name: string; class?: { name: string } }>;
  publishedAt: string;
  createdAt?: string;
}

const KEY = ["admin", "notices"] as const;

export function useAdminNotices(params: { search?: string; page?: number; limit?: number } = {}) {
  const queryClient = useQueryClient();
  const { search, page = 1, limit = 20 } = params;

  const query = useQuery({
    queryKey: [...KEY, { search, page, limit }],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (search) searchParams.set("search", search);
      searchParams.set("page", String(page));
      searchParams.set("limit", String(limit));
      const data = await adminRequest<unknown>(
        axios.get(`/api/admin/notices?${searchParams.toString()}`),
        "Failed to load notices.",
      );
      return asPaginated<NoticeItem>(data);
    },
  });

  const createNotice = useMutation({
    mutationFn: async (payload: {
      title: string;
      noticeBody: string;
      targetType: NoticeTargetType;
      targetSections?: string[];
    }) => {
      return adminRequest(axios.post("/api/admin/notices", payload), "Create failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });

  const deleteNotice = useMutation({
    mutationFn: async (id: string) => {
      return adminRequest(axios.delete(`/api/admin/notices/${id}`), "Delete failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });

  return { ...query, createNotice, deleteNotice };
}
