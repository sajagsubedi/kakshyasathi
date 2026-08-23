import { NextRequest } from "next/server";
import { withHandler } from "@/lib/api/ApiHandler";
import { requireAdmin } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import NoticeModel from "@/models/Notice.model";
import { parseObjectId } from "@/lib/api/parseId";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const DELETE = withHandler(
  async (_req: NextRequest, context: RouteContext) => {
    await requireAdmin();
    await connectDb();
    const { id } = await context.params;
    parseObjectId(id);

    const deleted = await NoticeModel.findByIdAndDelete(id);
    if (!deleted) throw new Error("Notice not found");
    return ApiResponse(null, "Notice deleted successfully");
  },
);
