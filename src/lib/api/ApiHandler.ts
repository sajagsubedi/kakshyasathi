import { NextRequest, NextResponse } from "next/server";
import { ErrorResponse } from "./ApiResponse";

type DefaultRouteContext = {
  params: Promise<Record<string, string>>;
};

type Handler<C = DefaultRouteContext> = (
  req: NextRequest,
  context: C,
) => Promise<NextResponse> | NextResponse;

export function withHandler<C = DefaultRouteContext>(handler: Handler<C>) {
  return async (req: NextRequest, context: C) => {
    try {
      return await handler(req, context);
    } catch (error) {
      return ErrorResponse(error);
    }
  };
}
