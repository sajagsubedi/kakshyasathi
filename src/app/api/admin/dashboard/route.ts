import { withHandler } from "@/lib/api/ApiHandler";
import { requireAdmin } from "@/lib/ValidatePermission";
import { ApiResponse } from "@/lib/api/ApiResponse";
import connectDb from "@/lib/connectDB";
import UserModel from "@/models/User.model";
import ClassModel from "@/models/Class.model";
import SectionModel from "@/models/Section.model";
import SubjectModel from "@/models/Subject.model";
import ClassroomModel from "@/models/Classroom.model";
import SmartBoardModel from "@/models/SmartBoard.model";
import AttendanceTerminalModel from "@/models/AttendanceTerminal.model";
import NoticeModel from "@/models/Notice.model";
import SubstitutionModel from "@/models/Substitution.model";
import StudentAttendanceModel from "@/models/StudentAttendance.model";
import { DeviceStatus, UserRole } from "@/types";

export const GET = withHandler(async () => {
  await requireAdmin();
  await connectDb();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [
    students,
    teachers,
    admins,
    classes,
    sections,
    subjects,
    classrooms,
    smartBoards,
    terminals,
    notices,
    substitutionsToday,
    attendanceToday,
    boardsByStatus,
    terminalsByStatus,
    recentNotices,
  ] = await Promise.all([
    UserModel.countDocuments({ role: UserRole.student }),
    UserModel.countDocuments({ role: UserRole.teacher }),
    UserModel.countDocuments({ role: UserRole.admin }),
    ClassModel.countDocuments(),
    SectionModel.countDocuments(),
    SubjectModel.countDocuments(),
    ClassroomModel.countDocuments(),
    SmartBoardModel.countDocuments(),
    AttendanceTerminalModel.countDocuments(),
    NoticeModel.countDocuments(),
    SubstitutionModel.countDocuments({
      date: { $gte: todayStart, $lte: todayEnd },
    }),
    StudentAttendanceModel.countDocuments({
      markedAt: { $gte: todayStart, $lte: todayEnd },
    }),
    SmartBoardModel.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    AttendanceTerminalModel.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    NoticeModel.find({})
      .populate("author", "name")
      .sort({ publishedAt: -1 })
      .limit(5)
      .lean(),
  ]);

  const statusCounts = (rows: Array<{ _id: string; count: number }>) => {
    const result: Record<string, number> = {
      [DeviceStatus.online]: 0,
      [DeviceStatus.offline]: 0,
      [DeviceStatus.syncing]: 0,
      [DeviceStatus.maintenance]: 0,
    };
    for (const row of rows) {
      result[row._id] = row.count;
    }
    return result;
  };

  return ApiResponse(
    {
      counts: {
        students,
        teachers,
        admins,
        classes,
        sections,
        subjects,
        classrooms,
        smartBoards,
        terminals,
        notices,
        substitutionsToday,
        attendanceToday,
      },
      smartBoardStatus: statusCounts(boardsByStatus),
      terminalStatus: statusCounts(terminalsByStatus),
      recentNotices,
    },
    "Dashboard fetched successfully",
  );
});
