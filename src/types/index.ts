import { Document, Types } from "mongoose";

// // ---------- Enums / literal unions ----------

export enum UserRole {
  admin = "admin",
  teacher = "teacher",
  student = "student",
}

export enum DeviceStatus {
  online = "online",
  offline = "offline",
  syncing = "syncing",
  maintenance = "maintenance",
}

export enum PersonType {
  student = "Student",
  teacher = "Teacher",
}

export enum PersonGender {
  male = "Male",
  female = "Female",
  other = "Other",
}

export enum ScanEventStatus {
  processed = "processed",
  duplicate = "duplicate",
  invalid = "invalid",
}

export enum AttendanceStatus {
  present = "present",
  late = "late",
}

export enum NoticeTargetType {
  all = "all",
  sections = "sections",
}

export enum DayOfWeek {
  sunday = "sunday",
  monday = "monday",
  tuesday = "tuesday",
  wednesday = "wednesday",
  thursday = "thursday",
  friday = "friday",
  saturday = "saturday",
}

// // ---------- User & Auth ----------

export interface UserDoc extends Document {
  role: UserRole;
  name: string;
  email: string;
  username: string;
  gender: PersonGender;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  isPasswordCorrect: (password: string) => Promise<boolean>;
}

export interface StudentDoc extends Document {
  user: Types.ObjectId; // ref User
  section: Types.ObjectId; // ref Section
  rollNumber: string;
  guardianContact?: string;
  symbolNumber: string;
  enrollmentYear: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeacherDoc extends Document {
  user: Types.ObjectId; // ref User
  subjects: Types.ObjectId[]; // ref Subject[]
  assignedSections: Types.ObjectId[]; // ref Section[]
  createdAt: Date;
  updatedAt: Date;
}

// // ---------- School structure ----------

export interface AcademicYearDoc extends Document {
  label: string; // e.g. "2082/83"
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClassDoc extends Document {
  name: string;
  grade: number;
  academicYear: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface SectionDoc extends Document {
  class: Types.ObjectId; // ref Class
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubjectDoc extends Document {
  name: string;
  code: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClassroomDoc extends Document {
  roomNumber: string;
  createdAt: Date;
  updatedAt: Date;
  section: Types.ObjectId; //section
}

// // ---------- Devices ----------

export interface SmartBoardDoc extends Document {
  classroom: Types.ObjectId; // ref Classroom
  deviceKey: string;
  status: DeviceStatus;
  lastSeenAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendanceTerminalDoc extends Document {
  terminalCode: string; // e.g. AT-204
  classroom: Types.ObjectId; // ref Classroom
  deviceKey: string;
  status: DeviceStatus;
  lastSeenAt?: Date;
  lastSyncedSequence: number;
  createdAt: Date;
  updatedAt: Date;
}

// // ---------- Timetable ----------

export interface GlobalTimetableDoc extends Document {
  academicYear: Types.ObjectId; // ref AcademicYear
  periodNumber: number;
  startTime: string; // "10:15"
  endTime: string; // "11:00"
  createdAt: Date;
  updatedAt: Date;
}

export interface SectionTimetableDoc extends Document {
  section: Types.ObjectId; // ref Section
  dayOfWeek: DayOfWeek;
  periodNumber: number;
  subject: Types.ObjectId; // ref Subject
  teacher: Types.ObjectId; // ref Teacher
  classroom: Types.ObjectId; // ref Classroom
  customStartTime?: string;
  customEndTime?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubstitutionDoc extends Document {
  section: Types.ObjectId; // ref Section
  periodNumber: number;
  date: Date;
  originalTeacher: Types.ObjectId; // ref Teacher
  substituteTeacher: Types.ObjectId; // ref Teacher
  createdAt: Date;
  updatedAt: Date;
}

// // ---------- Attendance & presence ----------

export interface ScanEventDoc extends Document {
  terminal: Types.ObjectId; // ref AttendanceTerminal
  cardCode: string;
  scannedAt: Date; // terminal's own clock
  receivedAt: Date; // backend clock
  sequenceNumber: number;
  personType: PersonType;
  person?: Types.ObjectId; // resolved Student or Teacher
  status: ScanEventStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendanceSessionDoc extends Document {
  section: Types.ObjectId; // ref Section
  classroom: Types.ObjectId; // ref Classroom
  date: Date;
  periodNumber: number;
  effectiveTeacher: Types.ObjectId; // ref Teacher
  effectiveSubject: Types.ObjectId; // ref Subject
  startTime: string;
  endTime: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendanceRecordDoc extends Document {
  attendanceSession: Types.ObjectId; // ref AttendanceSession
  student: Types.ObjectId; // ref Student
  scanEvent: Types.ObjectId; // ref ScanEvent
  markedAt: Date;
  status: AttendanceStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeacherPresenceRecordDoc extends Document {
  teacher: Types.ObjectId; // ref Teacher
  classroom: Types.ObjectId; // ref Classroom
  date: Date;
  periodNumber: number;
  entryScanEvent: Types.ObjectId; // ref ScanEvent
  exitScanEvent?: Types.ObjectId; // ref ScanEvent
  entryTime: Date;
  exitTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// // ---------- Notices ----------

export interface NoticeDoc extends Document {
  title: string;
  body: string;
  author: Types.ObjectId; // ref User
  targetType: NoticeTargetType;
  targetSections: Types.ObjectId[]; // ref Section, empty when targetType is "all"
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
