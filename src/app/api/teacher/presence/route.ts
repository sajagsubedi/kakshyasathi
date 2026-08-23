import { withHandler } from "@/lib/api/ApiHandler";
import { requireTeacher } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import TeacherModel from "@/models/Teacher.model";
import TeacherPresenceModel from "@/models/TeacherPresence.model";
import TimetableModel from "@/models/Timetable.model";

export const GET = withHandler(async () => {
  const session = await requireTeacher();
  await connectDb();

  const teacher = await TeacherModel.findOne({ user: session.user._id }).lean();
  if (!teacher) {
    return ApiResponse([], "Teacher profile not found");
  }

  const presence = await TeacherPresenceModel.find({ teacher: teacher._id })
    .populate("classroom", "roomNumber")
    .sort({ entryTime: -1 })
    .limit(50)
    .lean();

  const timetable = await TimetableModel.find({ teacher: teacher._id }).lean();
  const sectionByPeriod = new Map(
    timetable.map((t) => [t.periodNumber, String(t.section)]),
  );

  return ApiResponse(
    presence.map((p) => ({
      id: String(p._id),
      date: p.date,
      sectionId: sectionByPeriod.get(p.periodNumber) ?? "",
      periodNumber: p.periodNumber,
      enteredAt: p.entryTime,
      exitedAt: p.exitTime,
    })),
    "Teacher presence fetched successfully",
  );
});
