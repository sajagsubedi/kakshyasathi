import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { adminRequest, asPaginated } from "@/hooks/admin/http";
import type { DeviceStatus } from "@/types";

export interface DeviceClassroomRef {
  _id: string;
  roomNumber: string;
  section?: {
    _id: string;
    name: string;
    class?: { _id: string; name: string };
  };
}

export interface SmartBoardItem {
  _id: string;
  classroom: DeviceClassroomRef | string;
  deviceKey: string;
  status: DeviceStatus;
  lastSeenAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

const KEY = ["admin", "smart-boards"] as const;

type QueryParams = {
  search?: string;
  classroom?: string;
  status?: string;
  page?: number;
  limit?: number;
};

export function useAdminSmartBoards(params: QueryParams = {}) {
  const queryClient = useQueryClient();
  const { search, classroom, status, page = 1, limit = 20 } = params;

  const query = useQuery({
    queryKey: [...KEY, { search, classroom, status, page, limit }],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (search) searchParams.set("search", search);
      if (classroom) searchParams.set("classroom", classroom);
      if (status) searchParams.set("status", status);
      searchParams.set("page", String(page));
      searchParams.set("limit", String(limit));

      const data = await adminRequest<unknown>(
        axios.get(`/api/admin/smart-boards?${searchParams.toString()}`),
        "Failed to load smart boards.",
      );
      return asPaginated<SmartBoardItem>(data);
    },
  });

  const createSmartBoard = useMutation({
    mutationFn: async (payload: {
      classroom: string;
      deviceKey?: string;
      status?: DeviceStatus;
    }) => {
      return adminRequest(
        axios.post("/api/admin/smart-boards", payload),
        "Create failed",
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
    },
  });

  const updateSmartBoard = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<{
        classroom: string;
        deviceKey: string;
        status: DeviceStatus;
      }>;
    }) => {
      return adminRequest(
        axios.patch(`/api/admin/smart-boards/${id}`, payload),
        "Update failed",
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
    },
  });

  const deleteSmartBoard = useMutation({
    mutationFn: async (id: string) => {
      return adminRequest(
        axios.delete(`/api/admin/smart-boards/${id}`),
        "Delete failed",
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
    },
  });

  return {
    ...query,
    createSmartBoard,
    updateSmartBoard,
    deleteSmartBoard,
  };
}
