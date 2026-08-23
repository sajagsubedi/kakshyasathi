import { NextRequest } from "next/server";
import { withHandler } from "@/lib/api/ApiHandler";
import { requireAdmin } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import StudentAttendanceModel from "@/models/StudentAttendance.model";
import TeacherPresenceModel from "@/models/TeacherPresence.model";
import AttendanceSessionModel from "@/models/AttendanceSession.model";
import { getPagination } from "@/lib/api/pagination";
import { parseObjectId } from "@/lib/api/parseId";

function dayRange(date: string) {
  const start = new Date(date);
  if (Number.isNaN(start.getTime())) throw new Error("Invalid date");
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export const GET = withHandler(async (req: NextRequest) => {
  await requireAdmin();
  await connectDb();

  const { searchParams } = new URL(req.url);
  const { page, limit, skip } = getPagination(searchParams);
  const date = searchParams.get("date");
  const section = searchParams.get("section");
  const view = searchParams.get("view") === "presence" ? "presence" : "students";

  if (view === "presence") {
    const filter: Record<string, unknown> = {};
    if (date) {
      const { start, end } = dayRange(date);
      filter.date = { $gte: start, $lte: end };
    }

    const [items, total] = await Promise.all([
      TeacherPresenceModel.find(filter)
        .populate({
          path: "teacher",
          populate: { path: "user", select: "name username" },
        })
        .populate("classroom", "roomNumber")
        .sort({ entryTime: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      TeacherPresenceModel.countDocuments(filter),
    ]);

    return ApiResponse(
      { items, total, page, limit, totalPages: Math.ceil(total / limit) },
      "Teacher presence fetched successfully",
    );
  }

  const sessionFilter: Record<string, unknown> = {};
  if (date) {
    const { start, end } = dayRange(date);
    sessionFilter.date = { $gte: start, $lte: end };
  }
  if (section) {
    parseObjectId(section, "section");
    sessionFilter.section = section;
  }

  const sessions = await AttendanceSessionModel.find(sessionFilter)
    .select("_id")
    .lean();
  const sessionIds = sessions.map((session) => session._id);

  const filter = { attendanceSession: { $in: sessionIds } };

  const [items, total] = await Promise.all([
    StudentAttendanceModel.find(filter)
      .populate({
        path: "attendanceSession",
        populate: [
          { path: "section", populate: { path: "class", select: "name grade" } },
          { path: "classroom", select: "roomNumber" },
          { path: "effectiveTeacher", populate: { path: "user", select: "name" } },
          { path: "effectiveSubject", select: "name code" },
        ],
      })
      .populate({
        path: "student",
        populate: { path: "user", select: "name username" },
      })
      .sort({ markedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    StudentAttendanceModel.countDocuments(filter),
  ]);

  return ApiResponse(
    { items, total, page, limit, totalPages: Math.ceil(total / limit) },
    "Attendance fetched successfully",
  );
});
