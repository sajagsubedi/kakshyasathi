import { NextRequest, NextResponse } from "next/server";

import { ErrorResponse } from "@/lib/api/ApiResponse";

type RouteContext = { params: Promise<Record<string, string>> };

type Handler = (
  req: NextRequest,
  context: RouteContext,
) => Promise<NextResponse> | NextResponse;

export function withHandler(handler: Handler): Handler {
  return async (req, context) => {
    try {
      return await handler(req, context);
    } catch (error) {
      return ErrorResponse(error);
    }
  };
}
