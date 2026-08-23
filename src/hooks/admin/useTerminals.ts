import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { adminRequest, asPaginated } from "@/hooks/admin/http";
import type { DeviceStatus } from "@/types";
import type { DeviceClassroomRef } from "@/hooks/admin/useSmartBoards";

export interface TerminalItem {
  _id: string;
  terminalCode: string;
  classroom: DeviceClassroomRef | string;
  deviceKey: string;
  status: DeviceStatus;
  lastSeenAt?: string;
  lastSyncedSequence: number;
  createdAt?: string;
  updatedAt?: string;
}

const KEY = ["admin", "terminals"] as const;

type QueryParams = {
  search?: string;
  classroom?: string;
  status?: string;
  page?: number;
  limit?: number;
};

export function useAdminTerminals(params: QueryParams = {}) {
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
        axios.get(`/api/admin/terminals?${searchParams.toString()}`),
        "Failed to load terminals.",
      );
      return asPaginated<TerminalItem>(data);
    },
  });

  const createTerminal = useMutation({
    mutationFn: async (payload: {
      terminalCode: string;
      classroom: string;
      deviceKey?: string;
      status?: DeviceStatus;
    }) => {
      return adminRequest(
        axios.post("/api/admin/terminals", payload),
        "Create failed",
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
    },
  });

  const updateTerminal = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<{
        terminalCode: string;
        classroom: string;
        deviceKey: string;
        status: DeviceStatus;
      }>;
    }) => {
      return adminRequest(
        axios.patch(`/api/admin/terminals/${id}`, payload),
        "Update failed",
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
    },
  });

  const deleteTerminal = useMutation({
    mutationFn: async (id: string) => {
      return adminRequest(
        axios.delete(`/api/admin/terminals/${id}`),
        "Delete failed",
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
    },
  });

  return {
    ...query,
    createTerminal,
    updateTerminal,
    deleteTerminal,
  };
}
