import { Document, Types } from "mongoose";

// ---------- Enums / literal unions ----------

export enum UserRole {
  admin = "admin",
  teacher = "teacher",
  student = "student",
  smartboard = "smartboard",
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

// ---------- User & Auth ----------

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
  user: Types.ObjectId;
  section: Types.ObjectId;
  rollNumber: string;
  guardianContact?: string;
  symbolNumber: string;
  enrollmentYear: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeacherDoc extends Document {
  user: Types.ObjectId;
  subjects: Types.ObjectId[];
  assignedSections: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// ---------- School structure ----------

export interface AcademicYearDoc extends Document {
  label: string;
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
  class: Types.ObjectId;
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
  section: Types.ObjectId;
}

// ---------- Devices ----------

export interface SmartBoardDoc extends Document {
  classroom: Types.ObjectId;
  deviceKey: string;
  status: DeviceStatus;
  lastSeenAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendanceTerminalDoc extends Document {
  terminalCode: string;
  classroom: Types.ObjectId;
  deviceKey: string;
  status: DeviceStatus;
  lastSeenAt?: Date;
  lastSyncedSequence: number;
  createdAt: Date;
  updatedAt: Date;
}

// ---------- Timetable ----------

export interface GlobalTimetableDoc extends Document {
  academicYear: Types.ObjectId;
  periodNumber: number;
  startTime: string;
  endTime: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SectionTimetableDoc extends Document {
  section: Types.ObjectId;
  dayOfWeek: DayOfWeek;
  periodNumber: number;
  subject: Types.ObjectId;
  teacher: Types.ObjectId;
  classroom: Types.ObjectId;
  customStartTime?: string;
  customEndTime?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubstitutionDoc extends Document {
  section: Types.ObjectId;
  periodNumber: number;
  date: Date;
  originalTeacher: Types.ObjectId;
  substituteTeacher: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ---------- Attendance & presence ----------

export interface ScanEventDoc extends Document {
  terminal: Types.ObjectId;
  cardCode: string;
  scannedAt: Date;
  receivedAt: Date;
  sequenceNumber: number;
  personType: PersonType;
  person?: Types.ObjectId;
  status: ScanEventStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendanceSessionDoc extends Document {
  section: Types.ObjectId;
  classroom: Types.ObjectId;
  date: Date;
  periodNumber: number;
  effectiveTeacher: Types.ObjectId;
  effectiveSubject: Types.ObjectId;
  startTime: string;
  endTime: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendanceRecordDoc extends Document {
  attendanceSession: Types.ObjectId;
  student: Types.ObjectId;
  scanEvent: Types.ObjectId;
  markedAt: Date;
  status: AttendanceStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeacherPresenceRecordDoc extends Document {
  teacher: Types.ObjectId;
  classroom: Types.ObjectId;
  date: Date;
  periodNumber: number;
  entryScanEvent: Types.ObjectId;
  exitScanEvent?: Types.ObjectId;
  entryTime: Date;
  exitTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ---------- Notices ----------

export interface NoticeDoc extends Document {
  title: string;
  body: string;
  author: Types.ObjectId;
  targetType: NoticeTargetType;
  targetSections: Types.ObjectId[];
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// POPULATED TYPES
// ============================================================

/**
 * Class with academic year populated
 */
export type PopulatedClass = Omit<ClassDoc, "academicYear"> & {
  academicYear: AcademicYearDoc;
};

/**
 * Section with Class populated
 */
export type PopulatedSection = Omit<SectionDoc, "class"> & {
  class: PopulatedClass;
};

/**
 * Classroom with Section -> Class -> AcademicYear populated
 */
export type PopulatedClassroom = Omit<ClassroomDoc, "section"> & {
  section: PopulatedSection;
};

/**
 * SmartBoard with Classroom -> Section -> Class -> AcademicYear populated
 */
export type PopulatedSmartBoard = Omit<SmartBoardDoc, "classroom"> & {
  classroom: PopulatedClassroom;
};

/**
 * Teacher with User, Subjects and Sections populated
 */
export type PopulatedTeacher = Omit<
  TeacherDoc,
  "user" | "subjects" | "assignedSections"
> & {
  user: UserDoc;
  subjects: SubjectDoc[];
  assignedSections: PopulatedSection[];
};

/**
 * Student with User and Section populated
 */
export type PopulatedStudent = Omit<StudentDoc, "user" | "section"> & {
  user: UserDoc;
  section: PopulatedSection;
};

/**
 * Section timetable with all major references populated
 */
export type PopulatedSectionTimetable = Omit<
  SectionTimetableDoc,
  "section" | "subject" | "teacher" | "classroom"
> & {
  section: PopulatedSection;
  subject: SubjectDoc;
  teacher: TeacherDoc;
  classroom: PopulatedClassroom;
};

/**
 * Attendance terminal with classroom populated
 */
export type PopulatedAttendanceTerminal = Omit<
  AttendanceTerminalDoc,
  "classroom"
> & {
  classroom: PopulatedClassroom;
};

/**
 * Attendance session with references populated
 */
export type PopulatedAttendanceSession = Omit<
  AttendanceSessionDoc,
  "section" | "classroom" | "effectiveTeacher" | "effectiveSubject"
> & {
  section: PopulatedSection;
  classroom: PopulatedClassroom;
  effectiveTeacher: TeacherDoc;
  effectiveSubject: SubjectDoc;
};

/**
 * Attendance record with references populated
 */
export type PopulatedAttendanceRecord = Omit<
  AttendanceRecordDoc,
  "attendanceSession" | "student" | "scanEvent"
> & {
  attendanceSession: AttendanceSessionDoc;
  student: StudentDoc;
  scanEvent: ScanEventDoc;
};

/**
 * Teacher presence with teacher and classroom populated
 */
export type PopulatedTeacherPresenceRecord = Omit<
  TeacherPresenceRecordDoc,
  "teacher" | "classroom"
> & {
  teacher: TeacherDoc;
  classroom: PopulatedClassroom;
};

/**
 * Notice with author and sections populated
 */
export type PopulatedNotice = Omit<NoticeDoc, "author" | "targetSections"> & {
  author: UserDoc;
  targetSections: PopulatedSection[];
};
