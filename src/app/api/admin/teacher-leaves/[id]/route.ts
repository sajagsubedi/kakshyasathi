import { NextRequest } from "next/server";
import { withHandler } from "@/lib/api/ApiHandler";
import { requireAdmin } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import TeacherLeaveModel from "@/models/TeacherLeave.model";
import { parseObjectId } from "@/lib/api/parseId";
import { LeaveStatus } from "@/types";

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
    const doc = await TeacherLeaveModel.findById(id);
    if (!doc) throw new Error("Teacher leave not found");

    if (body.fromDate !== undefined) {
      const parsedFromDate = new Date(body.fromDate);
      if (Number.isNaN(parsedFromDate.getTime())) {
        throw new Error("Invalid from date");
      }
      doc.fromDate = parsedFromDate;
    }

    if (body.toDate !== undefined) {
      const parsedToDate = new Date(body.toDate);
      if (Number.isNaN(parsedToDate.getTime())) {
        throw new Error("Invalid to date");
      }
      doc.toDate = parsedToDate;
    }

    if (doc.fromDate > doc.toDate) {
      throw new Error("From date must be before or equal to to date");
    }

    if (body.reason !== undefined) {
      doc.reason = body.reason;
    }

    if (body.status !== undefined) {
      if (!Object.values(LeaveStatus).includes(body.status)) {
        throw new Error("Invalid status");
      }
      doc.status = body.status;
      
      // If status is being changed to approved or rejected, set reviewedBy
      if (body.status === LeaveStatus.approved || body.status === LeaveStatus.rejected) {
        // We'll need to get the current user from the session
        // For now, we'll leave this as is and assume the client handles the reviewedBy
        if (body.reviewedBy) {
          parseObjectId(body.reviewedBy, "reviewedBy");
          doc.reviewedBy = body.reviewedBy;
        }
      }
    }

    await doc.save();
    return ApiResponse(doc, "Teacher leave updated successfully");
  },
);

export const DELETE = withHandler(
  async (_req: NextRequest, context: RouteContext) => {
    await requireAdmin();
    await connectDb();
    const { id } = await context.params;
    parseObjectId(id);

    const leave = await TeacherLeaveModel.findById(id);
    if (!leave) throw new Error("Teacher leave not found");

    await TeacherLeaveModel.findByIdAndDelete(id);
    return ApiResponse(null, "Teacher leave deleted successfully");
  },
);