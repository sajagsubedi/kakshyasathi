import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { adminRequest } from "@/hooks/admin/http";
import { UserRole, DayOfWeek } from "@/types";

// ---------- Shared types ----------

export const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Helper to get day name from DayOfWeek enum
export const getDayName = (dayOfWeek: DayOfWeek): string => {
  const dayIndex = Object.values(DayOfWeek).indexOf(dayOfWeek);
  return dayNames[dayIndex] || dayOfWeek;
};

export interface StudentProfile {
  id: string;
  fullName: string;
  username: string;
  email?: string;
  sectionId: string;
  sectionName?: string;
  className?: string;
  grade?: number;
  academicYear?: string;
  rollNumber?: string;
  symbolNumber?: string;
  enrollmentYear?: string;
  guardianContact?: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  periodNumber?: number;
  sectionName?: string;
  scannedAt?: string;
}

export interface TimetableEntryDto {
  id: string;
  dayOfWeek: number;
  periodNumber: number;
  periodId?: string;
  subjectId: string;
  subjectName?: string;
  subjectCode?: string;
  teacherId: string;
  teacherName?: string;
  sectionId?: string;
  sectionName?: string;
  className?: string;
  classroomId?: string;
  roomNumber?: string;
  startTime?: string;
  endTime?: string;
  customStartTime?: string;
  customEndTime?: string;
  isCustomTiming?: boolean;
}

export interface NoticeDto {
  id: string;
  title: string;
  content: string;
  targetType?: string;
  targetSections?: string[];
  priority: string;
  createdAt: string;
}

export interface TeacherSectionDto {
  id: string;
  name: string;
  academicYear: string;
  className?: string;
  grade?: number;
  studentCount?: number;
}

export interface PresenceRecord {
  id: string;
  date: string;
  sectionId: string;
  sectionName?: string;
  periodNumber: number;
  periodId?: string;
  roomNumber?: string;
  enteredAt: string;
  exitedAt?: string;
}

export interface LookupData {
  sections: Array<{
    _id: string;
    name: string;
    class?: { name?: string; grade?: number };
  }>;
  subjects: Array<{ _id: string; name: string; code: string }>;
  teachers: Array<{ _id: string; user?: { name?: string; username?: string } }>;
  periods: Array<{
    _id: string;
    periodNumber: number;
    startTime: string;
    endTime: string;
  }>;
  users: Array<{
    id: string;
    fullName: string;
    username: string;
    role: string;
    sectionId?: string;
  }>;
  getSectionName: (id: string) => string;
  getSubjectName: (id: string) => string;
  getTeacherName: (id: string) => string;
  getPeriod: (
    id: string,
  ) => { periodNumber: number; startTime: string; endTime: string } | undefined;
}

// ---------- Student hooks ----------

export function useStudentProfile() {
  return useQuery({
    queryKey: ["student", "profile"],
    queryFn: async () => {
      return adminRequest<StudentProfile>(
        axios.get("/api/student/profile"),
        "Failed to load profile.",
      );
    },
  });
}

export function useStudentAttendance() {
  return useQuery({
    queryKey: ["student", "attendance"],
    queryFn: async () => {
      return adminRequest<AttendanceRecord[]>(
        axios.get("/api/student/attendance"),
        "Failed to load attendance.",
      );
    },
  });
}

export function useStudentTimetable() {
  return useQuery({
    queryKey: ["student", "timetable"],
    queryFn: async () => {
      return adminRequest<TimetableEntryDto[]>(
        axios.get("/api/student/timetable"),
        "Failed to load timetable.",
      );
    },
  });
}

export function useStudentNotices() {
  return useQuery({
    queryKey: ["student", "notices"],
    queryFn: async () => {
      return adminRequest<NoticeDto[]>(
        axios.get("/api/student/notices"),
        "Failed to load notices.",
      );
    },
  });
}

export function useStudentDashboard() {
  return useQuery({
    queryKey: ["student", "dashboard"],
    queryFn: async () => {
      return adminRequest<{
        profile: StudentProfile | null;
        attendance: AttendanceRecord[];
        timetable: TimetableEntryDto[];
        todaySchedule: TimetableEntryDto[];
        notices: NoticeDto[];
      }>(axios.get("/api/student/dashboard"), "Failed to load dashboard.");
    },
  });
}

export function useStudentSchedule() {
  return useQuery({
    queryKey: ["student", "schedule"],
    queryFn: async () => {
      return adminRequest<{
        isHoliday: boolean;
        holidayTitle?: string;
        isWeeklyOff: boolean;
        weeklyOffDay?: string;
        dayOfWeek?: string;
        date?: string;
        schedule: Array<{
          id: string;
          periodNumber: number;
          periodId?: string;
          subjectId: string;
          subjectName?: string;
          subjectCode?: string;
          teacherId: string;
          teacherName?: string;
          isSubstitute: boolean;
          classroomId?: string;
          roomNumber?: string;
          startTime?: string;
          endTime?: string;
          customStartTime?: string;
          customEndTime?: string;
          isCustomTiming?: boolean;
        }>;
      }>(
        axios.get("/api/student/schedule"),
        "Failed to load schedule.",
      );
    },
    refetchInterval: 60000, // Refresh every minute
  });
}

// ---------- Teacher hooks ----------

export function useTeacherTimetable() {
  return useQuery({
    queryKey: ["teacher", "timetable"],
    queryFn: async () => {
      return adminRequest<TimetableEntryDto[]>(
        axios.get("/api/teacher/timetable"),
        "Failed to load timetable.",
      );
    },
  });
}

export function useTeacherSections() {
  return useQuery({
    queryKey: ["teacher", "sections"],
    queryFn: async () => {
      return adminRequest<TeacherSectionDto[]>(
        axios.get("/api/teacher/sections"),
        "Failed to load sections.",
      );
    },
  });
}

export function useTeacherPresence() {
  return useQuery({
    queryKey: ["teacher", "presence"],
    queryFn: async () => {
      return adminRequest<PresenceRecord[]>(
        axios.get("/api/teacher/presence"),
        "Failed to load presence records.",
      );
    },
  });
}

export function useTeacherNotices() {
  return useQuery({
    queryKey: ["teacher", "notices"],
    queryFn: async () => {
      return adminRequest<NoticeDto[]>(
        axios.get("/api/teacher/notices"),
        "Failed to load notices.",
      );
    },
  });
}

export function useTeacherDashboard() {
  return useQuery({
    queryKey: ["teacher", "dashboard"],
    queryFn: async () => {
      return adminRequest<{
        sections: TeacherSectionDto[];
        timetable: TimetableEntryDto[];
        todaySchedule: TimetableEntryDto[];
        presence: PresenceRecord[];
        notices: NoticeDto[];
      }>(axios.get("/api/teacher/dashboard"), "Failed to load dashboard.");
    },
  });
}

export function useTeacherSchedule() {
  return useQuery({
    queryKey: ["teacher", "schedule"],
    queryFn: async () => {
      return adminRequest<{
        isHoliday: boolean;
        holidayTitle?: string;
        isWeeklyOff: boolean;
        weeklyOffDay?: string;
        dayOfWeek?: string;
        date?: string;
        schedule: Array<{
          id: string;
          periodNumber: number;
          periodId?: string;
          subjectId: string;
          subjectName?: string;
          subjectCode?: string;
          teacherId: string;
          teacherName?: string;
          isSubstitute: boolean;
          sectionId?: string;
          sectionName?: string;
          className?: string;
          classroomId?: string;
          roomNumber?: string;
          startTime?: string;
          endTime?: string;
          customStartTime?: string;
          customEndTime?: string;
          isCustomTiming?: boolean;
        }>;
      }>(
        axios.get("/api/teacher/schedule"),
        "Failed to load schedule.",
      );
    },
    refetchInterval: 60000, // Refresh every minute
  });
}

// ---------- Shared lookup hook ----------

export function useSharedLookup() {
  return useQuery({
    queryKey: ["shared", "lookup"],
    queryFn: async () => {
      return adminRequest<LookupData>(
        axios.get("/api/shared/lookup"),
        "Failed to load lookup data.",
      );
    },
  });
}

export {
  useAdminClassById,
  useAdminClassDetail,
  type AdminClassDetail,
} from "./admin/useClasses";

export {
  useAdminSectionById,
  useAdminSectionDetail,
  type AdminSectionDetail,
} from "./admin/useSections";

// ---------- Smartboard hooks ----------

export interface SmartboardClassroomData {
  sectionName: string;
  currentPeriod?: {
    periodNumber: number;
    subjectName: string;
    teacherName: string;
    isSubstitute: boolean;
    startTime: string;
    endTime: string;
  };
  nextPeriod?: {
    periodNumber: number;
    subjectName: string;
    teacherName: string;
    startTime: string;
    endTime: string;
  };
  attendanceSummary?: {
    present: number;
    total: number;
  };
}

export interface SmartboardAttendanceData {
  id: string;
  studentId: string;
  status: string;
  scannedAt?: string;
}

export function useSmartboardClassroom() {
  return useQuery({
    queryKey: ["smartboard", "classroom"],
    queryFn: async () => {
      return adminRequest<SmartboardClassroomData>(
        axios.get("/api/smartboard/classroom"),
        "Failed to load classroom data.",
      );
    },
    refetchInterval: 15000, // Refresh every 15 seconds for real-time updates
  });
}

export function useSmartboardNotices() {
  return useQuery({
    queryKey: ["smartboard", "notices"],
    queryFn: async () => {
      return adminRequest<NoticeDto[]>(
        axios.get("/api/smartboard/notices"),
        "Failed to load notices.",
      );
    },
    refetchInterval: 60000, // Refresh every minute
  });
}

export function useSmartboardAttendance() {
  return useQuery({
    queryKey: ["smartboard", "attendance"],
    queryFn: async () => {
      return adminRequest<SmartboardAttendanceData[]>(
        axios.get("/api/smartboard/attendance"),
        "Failed to load attendance.",
      );
    },
    refetchInterval: 10000, // Refresh every 10 seconds for real-time updates
  });
}

export function useSmartboardTimetable() {
  return useQuery({
    queryKey: ["smartboard", "timetable"],
    queryFn: async () => {
      return adminRequest<{
        timetable: TimetableEntryDto[];
        holidays: string[];
        weeklyOffDays: string[];
      }>(
        axios.get("/api/smartboard/timetable"),
        "Failed to load timetable.",
      );
    },
  });
}

export function useSmartboardSchedule() {
  return useQuery({
    queryKey: ["smartboard", "schedule"],
    queryFn: async () => {
      return adminRequest<{
        isHoliday: boolean;
        holidayTitle?: string;
        isWeeklyOff: boolean;
        weeklyOffDay?: string;
        dayOfWeek?: string;
        date?: string;
        schedule: Array<{
          id: string;
          periodNumber: number;
          periodId?: string;
          subjectId: string;
          subjectName?: string;
          subjectCode?: string;
          teacherId: string;
          teacherName?: string;
          isSubstitute: boolean;
          classroomId?: string;
          roomNumber?: string;
          startTime?: string;
          endTime?: string;
          customStartTime?: string;
          customEndTime?: string;
          isCustomTiming?: boolean;
        }>;
      }>(
        axios.get("/api/smartboard/schedule"),
        "Failed to load schedule.",
      );
    },
    refetchInterval: 60000, // Refresh every minute
  });
}

export function useBarcodeScan() {
  return useMutation({
    mutationFn: async ({
      barcode,
      role,
    }: {
      barcode: string;
      role: UserRole;
    }) => {
      return adminRequest(
        axios.post("/api/smartboard/scan", { barcode }),
        "Scan failed",
      );
    },
  });
}
