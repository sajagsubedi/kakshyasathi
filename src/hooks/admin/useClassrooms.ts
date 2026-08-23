import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { adminRequest, asPaginated } from "@/hooks/admin/http";

export interface ClassroomSectionRef {
  _id: string;
  name: string;
  class?: {
    _id: string;
    name: string;
    grade?: number;
  };
}

export interface ClassroomItem {
  _id: string;
  roomNumber: string;
  section: ClassroomSectionRef | string;
  createdAt?: string;
  updatedAt?: string;
}

const CLASSROOMS_KEY = ["admin", "classrooms"] as const;

type ClassroomsQueryParams = {
  search?: string;
  page?: number;
  limit?: number;
};

export function useAdminClassrooms(params: ClassroomsQueryParams = {}) {
  const queryClient = useQueryClient();
  const { search, page = 1, limit = 20 } = params;

  const classroomsQuery = useQuery({
    queryKey: [...CLASSROOMS_KEY, { search, page, limit }],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (search) searchParams.set("search", search);
      searchParams.set("page", String(page));
      searchParams.set("limit", String(limit));

      const data = await adminRequest<unknown>(
        axios.get(`/api/admin/classrooms?${searchParams.toString()}`),
        "Failed to load classrooms.",
      );
      return asPaginated<ClassroomItem>(data);
    },
  });

  const createClassroom = useMutation({
    mutationFn: async (payload: { roomNumber: string; section: string }) => {
      return adminRequest(
        axios.post("/api/admin/classrooms", payload),
        "Create failed",
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLASSROOMS_KEY });
    },
  });

  const updateClassroom = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<{ roomNumber: string; section: string }>;
    }) => {
      return adminRequest(
        axios.patch(`/api/admin/classrooms/${id}`, payload),
        "Update failed",
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLASSROOMS_KEY });
    },
  });

  const deleteClassroom = useMutation({
    mutationFn: async (id: string) => {
      return adminRequest(
        axios.delete(`/api/admin/classrooms/${id}`),
        "Delete failed",
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLASSROOMS_KEY });
    },
  });

  return {
    ...classroomsQuery,
    createClassroom,
    updateClassroom,
    deleteClassroom,
  };
}
