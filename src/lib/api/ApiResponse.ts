import { NextResponse } from "next/server";

import { ApiError } from "@/lib/api/ApiError";

export function ApiResponse<T>(data: T, message?: string, status = 200) {
  return NextResponse.json({ success: true, data, message }, { status });
}

export function ErrorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { success: false, error: error.message, code: error.code },
      { status: error.statusCode },
    );
  }

  console.error("Unhandled API error:", error);
  return NextResponse.json(
    { success: false, error: "Internal server error" },
    { status: 500 },
  );
}
