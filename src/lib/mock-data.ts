interface User {
  id: string;
  username: string;
  fullName: string;
  role: string;
  phone?: string;
  createdAt: string;
  profilePicture?: string;
  rollNumber?: string;
  classId?: string;
  sectionId?: string;
}

interface Class {
  id: string;
  name: string;
  grade: number;
  academicYear: string;
}

interface Section {
  id: string;
  classId: string;
  name: string;
  academicYear: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface Period {
  id: string;
  periodNumber: number;
  startTime: string;
  endTime: string;
}

interface SmartBoard {
  id: string;
  deviceId: string;
  name: string;
  sectionId: string;
  status: string;
  lastSeenAt: string;
}

interface TimetableEntry {
  id: string;
  sectionId: string;
  dayOfWeek: number;
  periodId: string;
  subjectId: string;
  teacherId: string;
}

interface Substitution {
  id: string;
  sectionId: string;
  date: string;
  periodId: string;
  regularTeacherId: string;
  substituteTeacherId: string;
}

interface StudentAttendance {
  id: string;
  studentId: string;
  sectionId: string;
  date: string;
  status: string;
  scannedAt: string;
}

interface TeacherPresence {
  id: string;
  teacherId: string;
  sectionId: string;
  date: string;
  periodId: string;
  enteredAt: string;
  exitedAt?: string;
}

interface Notice {
  id: string;
  title: string;
  content: string;
  createdBy: string;
  targetType: string;
  targetSections: string[];
  priority: string;
  status: string;
  createdAt: string;
  expiresAt?: string;
}

export const currentUser: User = {
  id: 'u-admin-001',
  username: 'admin',
  fullName: 'Rajesh Sharma',
  role: 'ADMIN',
  phone: '+977 9801234567',
  createdAt: '2024-01-15T08:00:00Z',
};

export const users: User[] = [
  currentUser,
  {
    id: 'u-teacher-001',
    username: 'msharma',
    fullName: 'Mr. Madhav Sharma',
    role: 'TEACHER',
    phone: '+977 9802345678',
    createdAt: '2024-01-20T08:00:00Z',
  profilePicture: '',
  },
  {
    id: 'u-teacher-002',
    username: 'sgurung',
    fullName: 'Ms. Sita Gurung',
    role: 'TEACHER',
    phone: '+977 9803456789',
    createdAt: '2024-01-22T08:00:00Z',
  },
  {
    id: 'u-teacher-003',
    username: 'rkhanal',
    fullName: 'Mr. Ram Khanal',
    role: 'TEACHER',
    phone: '+977 9804567890',
    createdAt: '2024-01-25T08:00:00Z',
  },
  {
    id: 'u-teacher-004',
    username: 'athapa',
    fullName: 'Ms. Anjali Thapa',
    role: 'TEACHER',
    phone: '+977 9805678901',
    createdAt: '2024-01-28T08:00:00Z',
  },
  {
    id: 'u-student-001',
    username: 'sajag',
    fullName: 'Sajag Maharjan',
    role: 'STUDENT',
    rollNumber: '10001',
    classId: 'c-001',
    sectionId: 's-001',
    phone: '+977 9806789012',
    createdAt: '2024-02-01T08:00:00Z',
  },
  {
    id: 'u-student-002',
    username: 'priya',
    fullName: 'Priya Shrestha',
    role: 'STUDENT',
    rollNumber: '10002',
    classId: 'c-001',
    sectionId: 's-001',
    phone: '+977 9807890123',
    createdAt: '2024-02-01T08:00:00Z',
  },
  {
    id: 'u-student-003',
    username: 'aayush',
    fullName: 'Aayush Tamang',
    role: 'STUDENT',
    rollNumber: '10003',
    classId: 'c-001',
    sectionId: 's-001',
    phone: '+977 9808901234',
    createdAt: '2024-02-01T08:00:00Z',
  },
  {
    id: 'u-student-004',
    username: 'nisha',
    fullName: 'Nisha Karki',
    role: 'STUDENT',
    rollNumber: '10004',
    classId: 'c-001',
    sectionId: 's-001',
    phone: '+977 9809012345',
    createdAt: '2024-02-01T08:00:00Z',
  },
  {
    id: 'u-student-005',
    username: 'bibek',
    fullName: 'Bibek Rai',
    role: 'STUDENT',
    rollNumber: '10005',
    classId: 'c-001',
    sectionId: 's-001',
    phone: '+977 9801123456',
    createdAt: '2024-02-01T08:00:00Z',
  },
  {
    id: 'u-student-006',
    username: 'sneha',
    fullName: 'Sneha Bhattarai',
    role: 'STUDENT',
    rollNumber: '10006',
    classId: 'c-001',
    sectionId: 's-001',
    phone: '+977 9802234567',
    createdAt: '2024-02-01T08:00:00Z',
  },
  {
    id: 'u-student-007',
    username: 'rohan',
    fullName: 'Rohan Adhikari',
    role: 'STUDENT',
    rollNumber: '10007',
    classId: 'c-001',
    sectionId: 's-001',
    phone: '+977 9803345678',
    createdAt: '2024-02-01T08:00:00Z',
  },
  {
    id: 'u-student-008',
    username: 'ishika',
    fullName: 'Ishika Maharjan',
    role: 'STUDENT',
    rollNumber: '10008',
    classId: 'c-001',
    sectionId: 's-001',
    phone: '+977 9804456789',
    createdAt: '2024-02-01T08:00:00Z',
  },
];

export const classes: Class[] = [
  { id: 'c-001', name: 'Grade 10', grade: 10, academicYear: '2025-2026' },
  { id: 'c-002', name: 'Grade 11', grade: 11, academicYear: '2025-2026' },
  { id: 'c-003', name: 'Grade 9', grade: 9, academicYear: '2025-2026' },
];

export const sections: Section[] = [
  { id: 's-001', classId: 'c-001', name: 'A', academicYear: '2025-2026' },
  { id: 's-002', classId: 'c-001', name: 'B', academicYear: '2025-2026' },
  { id: 's-003', classId: 'c-002', name: 'A', academicYear: '2025-2026' },
  { id: 's-004', classId: 'c-003', name: 'A', academicYear: '2025-2026' },
];

export const subjects: Subject[] = [
  { id: 'sub-001', name: 'Mathematics', code: 'MATH' },
  { id: 'sub-002', name: 'Science', code: 'SCI' },
  { id: 'sub-003', name: 'English', code: 'ENG' },
  { id: 'sub-004', name: 'Computer Science', code: 'CS' },
  { id: 'sub-005', name: 'Social Studies', code: 'SOC' },
  { id: 'sub-006', name: 'Nepali', code: 'NEP' },
];

export const periods: Period[] = [
  { id: 'p-1', periodNumber: 1, startTime: '10:15', endTime: '11:00' },
  { id: 'p-2', periodNumber: 2, startTime: '11:00', endTime: '11:45' },
  { id: 'p-3', periodNumber: 3, startTime: '11:45', endTime: '12:30' },
  { id: 'p-4', periodNumber: 4, startTime: '12:30', endTime: '13:15' },
  { id: 'p-5', periodNumber: 5, startTime: '13:15', endTime: '14:00' },
  { id: 'p-6', periodNumber: 6, startTime: '14:00', endTime: '14:45' },
  { id: 'p-7', periodNumber: 7, startTime: '14:45', endTime: '15:30' },
  { id: 'p-8', periodNumber: 8, startTime: '15:30', endTime: '16:15' },
];

export const smartBoards: SmartBoard[] = [
  {
    id: 'sb-001',
    deviceId: 'SB-001',
    name: 'Classroom 10-A Board',
    sectionId: 's-001',
    status: 'ONLINE',
    lastSeenAt: '2026-08-15T10:30:00Z',
  },
  {
    id: 'sb-002',
    deviceId: 'SB-002',
    name: 'Classroom 10-B Board',
    sectionId: 's-002',
    status: 'ONLINE',
    lastSeenAt: '2026-08-15T10:28:00Z',
  },
  {
    id: 'sb-003',
    deviceId: 'SB-003',
    name: 'Classroom 11-A Board',
    sectionId: 's-003',
    status: 'OFFLINE',
    lastSeenAt: '2026-08-14T16:15:00Z',
  },
  {
    id: 'sb-004',
    deviceId: 'SB-004',
    name: 'Classroom 9-A Board',
    sectionId: 's-004',
    status: 'ONLINE',
    lastSeenAt: '2026-08-15T10:25:00Z',
  },
];

export const timetable: TimetableEntry[] = [
  // Grade 10 - Section A - Sunday (day 0)
  { id: 'tt-001', sectionId: 's-001', dayOfWeek: 0, periodId: 'p-1', subjectId: 'sub-001', teacherId: 'u-teacher-001' },
  { id: 'tt-002', sectionId: 's-001', dayOfWeek: 0, periodId: 'p-2', subjectId: 'sub-002', teacherId: 'u-teacher-002' },
  { id: 'tt-003', sectionId: 's-001', dayOfWeek: 0, periodId: 'p-3', subjectId: 'sub-003', teacherId: 'u-teacher-003' },
  { id: 'tt-004', sectionId: 's-001', dayOfWeek: 0, periodId: 'p-4', subjectId: 'sub-004', teacherId: 'u-teacher-004' },
  // Monday (day 1)
  { id: 'tt-005', sectionId: 's-001', dayOfWeek: 1, periodId: 'p-1', subjectId: 'sub-002', teacherId: 'u-teacher-002' },
  { id: 'tt-006', sectionId: 's-001', dayOfWeek: 1, periodId: 'p-2', subjectId: 'sub-001', teacherId: 'u-teacher-001' },
  { id: 'tt-007', sectionId: 's-001', dayOfWeek: 1, periodId: 'p-3', subjectId: 'sub-005', teacherId: 'u-teacher-003' },
  { id: 'tt-008', sectionId: 's-001', dayOfWeek: 1, periodId: 'p-4', subjectId: 'sub-006', teacherId: 'u-teacher-004' },
  // Tuesday (day 2)
  { id: 'tt-009', sectionId: 's-001', dayOfWeek: 2, periodId: 'p-1', subjectId: 'sub-003', teacherId: 'u-teacher-003' },
  { id: 'tt-010', sectionId: 's-001', dayOfWeek: 2, periodId: 'p-2', subjectId: 'sub-001', teacherId: 'u-teacher-001' },
  { id: 'tt-011', sectionId: 's-001', dayOfWeek: 2, periodId: 'p-3', subjectId: 'sub-002', teacherId: 'u-teacher-002' },
  { id: 'tt-012', sectionId: 's-001', dayOfWeek: 2, periodId: 'p-4', subjectId: 'sub-004', teacherId: 'u-teacher-004' },
];

export const substitutions: Substitution[] = [
  {
    id: 'sub-001',
    sectionId: 's-001',
    date: '2026-08-15',
    periodId: 'p-2',
    regularTeacherId: 'u-teacher-002',
    substituteTeacherId: 'u-teacher-004',
  },
];

export const periodOverrides: { id: string; sectionId: string; date: string; periodId: string; startTime: string; endTime: string }[] = [
  {
    id: 'po-001',
    sectionId: 's-001',
    date: '2026-08-15',
    periodId: 'p-7',
    startTime: '14:45',
    endTime: '16:00',
  },
];

export const studentAttendance: StudentAttendance[] = [
  { id: 'a-001', studentId: 'u-student-001', sectionId: 's-001', date: '2026-08-15', status: 'PRESENT', scannedAt: '2026-08-15T08:21:00Z' },
  { id: 'a-002', studentId: 'u-student-002', sectionId: 's-001', date: '2026-08-15', status: 'PRESENT', scannedAt: '2026-08-15T08:15:00Z' },
  { id: 'a-003', studentId: 'u-student-003', sectionId: 's-001', date: '2026-08-15', status: 'PRESENT', scannedAt: '2026-08-15T08:30:00Z' },
  { id: 'a-004', studentId: 'u-student-004', sectionId: 's-001', date: '2026-08-15', status: 'PRESENT', scannedAt: '2026-08-15T08:18:00Z' },
  { id: 'a-005', studentId: 'u-student-005', sectionId: 's-001', date: '2026-08-15', status: 'ABSENT', scannedAt: '' },
  { id: 'a-006', studentId: 'u-student-006', sectionId: 's-001', date: '2026-08-15', status: 'PRESENT', scannedAt: '2026-08-15T08:25:00Z' },
  { id: 'a-007', studentId: 'u-student-007', sectionId: 's-001', date: '2026-08-15', status: 'LATE', scannedAt: '2026-08-15T10:05:00Z' },
  { id: 'a-008', studentId: 'u-student-008', sectionId: 's-001', date: '2026-08-15', status: 'PRESENT', scannedAt: '2026-08-15T08:12:00Z' },
];

export const teacherPresence: TeacherPresence[] = [
  { id: 'tp-001', teacherId: 'u-teacher-001', sectionId: 's-001', date: '2026-08-15', periodId: 'p-1', enteredAt: '2026-08-15T10:16:00Z' },
  { id: 'tp-002', teacherId: 'u-teacher-004', sectionId: 's-001', date: '2026-08-15', periodId: 'p-2', enteredAt: '2026-08-15T11:02:00Z' },
];

export const notices: Notice[] = [
  {
    id: 'n-001',
    title: 'Annual Sports Week',
    content: 'The annual sports week will be held from August 20-25. All students are encouraged to participate.',
    createdBy: 'u-admin-001',
    targetType: 'ALL',
    targetSections: [],
    priority: 'HIGH',
    status: 'ACTIVE',
    createdAt: '2026-08-14T10:00:00Z',
    expiresAt: '2026-08-26T23:59:00Z',
  },
  {
    id: 'n-002',
    title: 'Science Practical Exam',
    content: 'Science practical exam for Grade 10-A and 10-B will be held on Friday during Period 7. Timing has been adjusted accordingly.',
    createdBy: 'u-admin-001',
    targetType: 'SELECTED_SECTIONS',
    targetSections: ['s-001', 's-002'],
    priority: 'MEDIUM',
    status: 'ACTIVE',
    createdAt: '2026-08-15T08:00:00Z',
    expiresAt: '2026-08-22T23:59:00Z',
  },
  {
    id: 'n-003',
    title: 'Library Books Return',
    content: 'All students must return library books before the end of this week.',
    createdBy: 'u-admin-001',
    targetType: 'ALL',
    targetSections: [],
    priority: 'LOW',
    status: 'ACTIVE',
    createdAt: '2026-08-13T09:00:00Z',
  },
];

export const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const dayShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function getSectionName(sectionId: string): string {
  const section = sections.find((s) => s.id === sectionId);
  if (!section) return 'Unknown';
  const cls = classes.find((c) => c.id === section.classId);
  return cls ? `${cls.name} - ${section.name}` : `Section ${section.name}`;
}

export function getSubjectName(subjectId: string): string {
  return subjects.find((s) => s.id === subjectId)?.name || 'Free';
}

export function getTeacherName(teacherId: string): string {
  return users.find((u) => u.id === teacherId)?.fullName || 'Unassigned';
}

export function getPeriod(periodId: string): Period | undefined {
  return periods.find((p) => p.id === periodId);
}
