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

  const [presence, timetable] = await Promise.all([
    TeacherPresenceModel.find({ teacher: teacher._id })
      .populate("classroom", "roomNumber")
      .sort({ entryTime: -1 })
      .limit(50)
      .lean(),
    TimetableModel.find({ teacher: teacher._id })
      .populate({
        path: "section",
        populate: { path: "class", select: "name" },
      })
      .lean(),
  ]);

  const sectionByPeriod = new Map<number, { id: string; label: string }>();
  timetable.forEach((t) => {
    const secObj = t.section as unknown as { _id?: unknown; name?: string; class?: { name?: string } } | undefined;
    const label = secObj?.class?.name ? `${secObj.class.name} - ${secObj.name}` : `Section ${secObj?.name || '—'}`;
    sectionByPeriod.set(t.periodNumber, {
      id: String(secObj?._id || t.section),
      label,
    });
  });

  return ApiResponse(
    presence.map((p) => {
      const roomObj = p.classroom as unknown as { roomNumber?: string } | undefined;
      const secInfo = sectionByPeriod.get(p.periodNumber);

      return {
        id: String(p._id),
        date: p.date ? new Date(p.date).toISOString().split("T")[0] : "",
        sectionId: secInfo?.id ?? "",
        sectionName: secInfo?.label,
        periodNumber: p.periodNumber,
        roomNumber: roomObj?.roomNumber ?? "",
        enteredAt: p.entryTime ? new Date(p.entryTime).toISOString() : "",
        exitedAt: p.exitTime ? new Date(p.exitTime).toISOString() : undefined,
      };
    }),
    "Teacher presence fetched successfully",
  );
});
