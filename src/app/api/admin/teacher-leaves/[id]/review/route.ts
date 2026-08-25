import { NextRequest } from "next/server";
import { withHandler } from "@/lib/api/ApiHandler";
import { requireAdmin } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import TeacherLeaveModel from "@/models/TeacherLeave.model";
import { parseObjectId } from "@/lib/api/parseId";
import { LeaveStatus } from "@/types";
import { auth } from "@/lib/auth";
import UserModel from "@/models/User.model";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const POST = withHandler(
  async (req: NextRequest, context: RouteContext) => {
    await requireAdmin();
    await connectDb();
    const { id } = await context.params;
    parseObjectId(id);

    const body = await req.json();
    const { status } = body;

    if (!status || !Object.values(LeaveStatus).includes(status)) {
      throw new Error("Valid status is required (approved or rejected)");
    }

    if (status !== LeaveStatus.approved && status !== LeaveStatus.rejected) {
      throw new Error("Status must be either approved or rejected");
    }

    const doc = await TeacherLeaveModel.findById(id);
    if (!doc) throw new Error("Teacher leave not found");

    if (doc.status !== LeaveStatus.pending) {
      throw new Error("Can only review pending leave requests");
    }

    // Get current user from session
    const session = await auth();
    if (!session?.user?._id) {
      throw new Error("User not authenticated");
    }

    const user = await UserModel.findById(session.user._id);
    if (!user) {
      throw new Error("User not found");
    }

    doc.status = status;
    doc.reviewedBy = user._id;

    await doc.save();
    
    const updatedDoc = await TeacherLeaveModel.findById(id)
      .populate("teacher", "user")
      .populate("reviewedBy", "name email")
      .lean();

    return ApiResponse(updatedDoc, `Teacher leave ${status} successfully`);
  },
);