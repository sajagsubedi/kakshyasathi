export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'SMARTBOARD';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  rollNumber?: string;
  classId?: string;
  sectionId?: string;
  profilePicture?: string;
  createdAt?: string;
}

export interface Class {
  id: string;
  name: string;
  grade: number;
  academicYear: string;
}

export interface Section {
  id: string;
  classId: string;
  name: string;
  academicYear: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
}

export interface Period {
  id: string;
  periodNumber: number;
  startTime: string;
  endTime: string;
}

export interface SmartBoard {
  id: string;
  deviceId: string;
  name: string;
  sectionId: string;
  status: 'ONLINE' | 'OFFLINE';
  lastSeenAt?: string;
}

export interface TimetableEntry {
  id: string;
  sectionId: string;
  dayOfWeek: number;
  periodId: string;
  subjectId: string;
  teacherId: string;
}

export interface Substitution {
  id: string;
  sectionId: string;
  date: string;
  periodId: string;
  regularTeacherId: string;
  substituteTeacherId: string;
}

export interface PeriodOverride {
  id: string;
  sectionId: string;
  date: string;
  periodId: string;
  startTime: string;
  endTime: string;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

export interface StudentAttendance {
  id: string;
  studentId: string;
  sectionId: string;
  date: string;
  status: AttendanceStatus;
  scannedAt: string;
}

export interface TeacherPresence {
  id: string;
  teacherId: string;
  sectionId: string;
  date: string;
  periodId: string;
  enteredAt: string;
  exitedAt?: string;
}

export type NoticeTargetType = 'ALL' | 'SELECTED_SECTIONS';
export type NoticePriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type NoticeStatus = 'ACTIVE' | 'EXPIRED' | 'DRAFT';

export interface Notice {
  id: string;
  title: string;
  content: string;
  createdBy: string;
  targetType: NoticeTargetType;
  targetSections: string[];
  priority: NoticePriority;
  status: NoticeStatus;
  createdAt: string;
  expiresAt?: string;
}

export interface EffectivePeriod {
  periodId: string;
  periodNumber: number;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  isSubstitute: boolean;
  startTime: string;
  endTime: string;
}

export interface ClassroomStatus {
  sectionId: string;
  sectionName: string;
  date: string;
  currentPeriod?: EffectivePeriod;
  nextPeriod?: EffectivePeriod;
  attendanceSummary: {
    present: number;
    absent: number;
    late: number;
    total: number;
  };
}

export interface DashboardStats {
  students: number;
  teachers: number;
  classes: number;
  sections: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  attendanceRate: number;
  activeBoards: number;
  totalBoards: number;
  activeNotices: number;
  substitutionsToday: number;
}
