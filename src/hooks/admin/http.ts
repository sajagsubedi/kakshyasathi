import axios from "axios";
import { ApiResponse } from "@/types/response";

export function getApiErrorMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as
      | { message?: string; error?: string }
      | undefined;
    return data?.message || data?.error || fallback;
  }

  if (err instanceof Error && err.message) {
    return err.message;
  }

  return fallback;
}

export async function adminRequest<T>(
  request: Promise<{ data: ApiResponse }>,
  fallback: string,
): Promise<T> {
  try {
    const res = await request;
    if (!res.data.success) {
      throw new Error(res.data.message || fallback);
    }
    return res.data.data as T;
  } catch (err) {
    throw new Error(getApiErrorMessage(err, fallback));
  }
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function asPaginated<T>(data: unknown): Paginated<T> {
  if (Array.isArray(data)) {
    return {
      items: data as T[],
      total: data.length,
      page: 1,
      limit: data.length,
      totalPages: 1,
    };
  }

  return data as Paginated<T>;
}
