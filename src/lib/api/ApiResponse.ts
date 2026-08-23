import { NextResponse } from "next/server";

import { ApiError } from "@/lib/api/ApiError";

export function ApiResponse<T>(data: T, message?: string, status = 200) {
  return NextResponse.json({ success: true, data, message }, { status });
}

export function ErrorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: error.message,
        code: error.code,
      },
      { status: error.statusCode },
    );
  }

  if (error instanceof Error) {
    const mongoCode = (error as Error & { code?: number }).code;

    if (mongoCode === 11000) {
      const message = "A record with this value already exists";
      return NextResponse.json(
        { success: false, error: message, message },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { success: false, error: error.message, message: error.message },
      { status: 400 },
    );
  }

  console.error("Unhandled API error:", error);
  return NextResponse.json(
    {
      success: false,
      error: "Internal server error",
      message: "Internal server error",
    },
    { status: 500 },
  );
}
