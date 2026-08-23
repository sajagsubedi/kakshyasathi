import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { adminRequest, asPaginated } from "@/hooks/admin/http";
import { PersonGender, UserRole } from "@/types";

export interface AdminUserItem {
  _id: string;
  role: UserRole;
  name: string;
  username: string;
  email: string;
  gender: PersonGender;
  createdAt?: string;
  student?: {
    _id: string;
    rollNumber?: string;
    symbolNumber?: string;
    enrollmentYear?: string;
    guardianContact?: string;
    section:
      | string
      | {
          _id: string;
          name: string;
          class?: { _id: string; name: string };
        };
  } | null;
  teacher?: {
    _id: string;
    subjects: Array<{ _id: string; name: string; code: string } | string>;
    assignedSections: Array<
      | string
      | { _id: string; name: string; class?: { _id: string; name: string } }
    >;
  } | null;
}

export interface CreateUserPayload {
  role: UserRole;
  name: string;
  username: string;
  email: string;
  password: string;
  gender: PersonGender;
  section?: string;
  rollNumber?: string;
  symbolNumber?: string;
  enrollmentYear?: string;
  guardianContact?: string;
  subjects?: string[];
  assignedSections?: string[];
}

const KEY = ["admin", "users"] as const;

type QueryParams = {
  search?: string;
  role?: string;
  page?: number;
  limit?: number;
};

export function useAdminUsers(params: QueryParams = {}) {
  const queryClient = useQueryClient();
  const { search, role, page = 1, limit = 20 } = params;

  const query = useQuery({
    queryKey: [...KEY, { search, role, page, limit }],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (search) searchParams.set("search", search);
      if (role && role !== "all") searchParams.set("role", role);
      searchParams.set("page", String(page));
      searchParams.set("limit", String(limit));
      const data = await adminRequest<unknown>(
        axios.get(`/api/admin/users?${searchParams.toString()}`),
        "Failed to load users.",
      );
      return asPaginated<AdminUserItem>(data);
    },
  });

  const createUser = useMutation({
    mutationFn: async (payload: CreateUserPayload) => {
      return adminRequest(axios.post("/api/admin/users", payload), "Create failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
    },
  });

  const updateUser = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateUserPayload>;
    }) => {
      return adminRequest(
        axios.patch(`/api/admin/users/${id}`, payload),
        "Update failed",
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
      queryClient.invalidateQueries({ queryKey: ["admin", "user"] });
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      return adminRequest(axios.delete(`/api/admin/users/${id}`), "Delete failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
    },
  });

  return { ...query, createUser, updateUser, deleteUser };
}

export function useAdminUser(id?: string) {
  return useQuery({
    queryKey: ["admin", "user", id],
    enabled: Boolean(id),
    queryFn: async () => {
      return adminRequest<AdminUserItem>(
        axios.get(`/api/admin/users/${id}`),
        "Failed to load user.",
      );
    },
  });
}
