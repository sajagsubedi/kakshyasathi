import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { adminRequest } from "@/hooks/admin/http";

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

export interface StudentProfile {
  id: string;
  fullName: string;
  username: string;
  email?: string;
  sectionId: string;
  sectionName?: string;
  className?: string;
  rollNumber?: string;
  symbolNumber?: string;
  enrollmentYear?: string;
  guardianContact?: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  scannedAt?: string;
}

export interface TimetableEntryDto {
  id: string;
  dayOfWeek: number;
  periodNumber: number;
  subjectId: string;
  teacherId: string;
  sectionId?: string;
  customStartTime?: string;
  customEndTime?: string;
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
  studentCount?: number;
}

export interface PresenceRecord {
  id: string;
  date: string;
  sectionId: string;
  periodNumber: number;
  enteredAt: string;
  exitedAt?: string;
}

export interface LookupData {
  sections: Array<{ _id: string; name: string; class?: { name?: string; grade?: number } }>;
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
  getPeriod: (id: string) => { periodNumber: number; startTime: string; endTime: string } | undefined;
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
        todaySchedule: Array<{ id: string; periodNumber: number; subjectId: string; teacherId: string }>;
        notices: NoticeDto[];
      }>(axios.get("/api/student/dashboard"), "Failed to load dashboard.");
    },
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
        "Failed to load presence.",
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
        todaySchedule: Array<{ id: string; sectionId: string; periodNumber: number; subjectId: string }>;
        presence: PresenceRecord[];
        notices: NoticeDto[];
      }>(axios.get("/api/teacher/dashboard"), "Failed to load dashboard.");
    },
  });
}

// ---------- Shared lookup ----------

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

// ---------- Admin lookup + class detail ----------

export function useAdminLookup() {
  return useQuery({
    queryKey: ["admin", "lookup"],
    queryFn: async () => {
      return adminRequest<LookupData>(
        axios.get("/api/admin/lookup"),
        "Failed to load lookup data.",
      );
    },
  });
}

export interface AdminClassDetail {
  class: { _id: string; name: string; grade: number; academicYear: string };
  sections: Array<{ id: string; name: string; academicYear: string; studentCount: number }>;
  students: Array<{
    id: string;
    fullName: string;
    username: string;
    email: string;
    phone: string;
    sectionId: string;
    rollNumber: string;
  }>;
  attendance: {
    today: { present: number; absent: number; late: number };
    overall: { rate: number };
    recent: Array<{
      id: string;
      date: string;
      status: string;
      studentId: string;
      scannedAt: string;
      sectionId: string;
    }>;
  };
  timetable: Array<{
    id: string;
    dayOfWeek: number;
    periodNumber: number;
    sectionId: string;
    subjectId: string;
    subjectName: string;
    teacherId: string;
    teacherName: string;
    startTime: string;
    endTime: string;
  }>;
  teacherCount: number;
}

export function useAdminClassById(id?: string) {
  return useQuery({
    queryKey: ["admin", "class", id],
    enabled: Boolean(id),
    queryFn: async () => {
      return adminRequest<AdminClassDetail>(
        axios.get(`/api/admin/classes/${id}/details`),
        "Failed to load class details.",
      );
    },
  });
}
