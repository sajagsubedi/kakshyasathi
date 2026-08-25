import { NextRequest } from "next/server";
import { withHandler } from "@/lib/api/ApiHandler";
import { requireAdmin } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import TeacherLeaveModel from "@/models/TeacherLeave.model";
import TeacherModel from "@/models/Teacher.model";
import { parseObjectId } from "@/lib/api/parseId";
import { LeaveStatus } from "@/types";

export const GET = withHandler(async (req: NextRequest) => {
  await requireAdmin();
  await connectDb();

  const { searchParams } = new URL(req.url);
  const teacher = searchParams.get("teacher");
  const status = searchParams.get("status");

  const query: any = {};
  
  if (teacher) {
    parseObjectId(teacher, "teacher");
    query.teacher = teacher;
  }
  
  if (status && Object.values(LeaveStatus).includes(status as LeaveStatus)) {
    query.status = status;
  }

  const items = await TeacherLeaveModel.find(query)
    .populate("teacher", "user")
    .populate("reviewedBy", "name email")
    .sort({ fromDate: -1 })
    .lean();

  return ApiResponse(items, "Teacher leaves fetched successfully");
});

export const POST = withHandler(async (req: NextRequest) => {
  await requireAdmin();
  await connectDb();

  const body = await req.json();
  const { teacher, fromDate, toDate, reason } = body;

  if (!teacher) throw new Error("Teacher is required");
  parseObjectId(teacher, "teacher");

  const teacherDoc = await TeacherModel.findById(teacher);
  if (!teacherDoc) throw new Error("Teacher not found");

  if (!fromDate) throw new Error("From date is required");
  const parsedFromDate = new Date(fromDate);
  if (Number.isNaN(parsedFromDate.getTime())) {
    throw new Error("Invalid from date");
  }

  if (!toDate) throw new Error("To date is required");
  const parsedToDate = new Date(toDate);
  if (Number.isNaN(parsedToDate.getTime())) {
    throw new Error("Invalid to date");
  }

  if (parsedFromDate > parsedToDate) {
    throw new Error("From date must be before or equal to to date");
  }

  if (!reason) throw new Error("Reason is required");

  const doc = await TeacherLeaveModel.create({
    teacher,
    fromDate: parsedFromDate,
    toDate: parsedToDate,
    reason,
    status: LeaveStatus.pending,
  });

  return ApiResponse(doc, "Teacher leave created successfully", 201);
});