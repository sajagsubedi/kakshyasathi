import { NextRequest } from "next/server";
import { withHandler } from "@/lib/api/ApiHandler";
import { requireAdmin } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import HolidayModel from "@/models/Holiday.model";
import { parseObjectId } from "@/lib/api/parseId";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const PATCH = withHandler(
  async (req: NextRequest, context: RouteContext) => {
    await requireAdmin();
    await connectDb();
    const { id } = await context.params;
    parseObjectId(id);

    const body = await req.json();
    const doc = await HolidayModel.findById(id);
    if (!doc) throw new Error("Holiday not found");

    if (body.date !== undefined) {
      const parsedDate = new Date(body.date);
      if (Number.isNaN(parsedDate.getTime())) {
        throw new Error("Invalid date");
      }
      
      // Check for duplicate if date is changing
      if (parsedDate.getTime() !== doc.date.getTime()) {
        const duplicate = await HolidayModel.findOne({
          academicYear: doc.academicYear,
          date: parsedDate,
          _id: { $ne: id },
        });
        if (duplicate) throw new Error("A holiday already exists for this date");
      }
      doc.date = parsedDate;
    }

    if (body.title !== undefined) {
      doc.title = body.title;
    }

    if (body.type !== undefined) {
      doc.type = body.type;
    }

    await doc.save();
    return ApiResponse(doc, "Holiday updated successfully");
  },
);

export const DELETE = withHandler(
  async (_req: NextRequest, context: RouteContext) => {
    await requireAdmin();
    await connectDb();
    const { id } = await context.params;
    parseObjectId(id);

    const holiday = await HolidayModel.findById(id);
    if (!holiday) throw new Error("Holiday not found");

    await HolidayModel.findByIdAndDelete(id);
    return ApiResponse(null, "Holiday deleted successfully");
  },
);