'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api-client';
import type {
  Class,
  DashboardStats,
  Notice,
  Period,
  Section,
  SmartBoard,
  StudentAttendance,
  Subject,
  Substitution,
  TeacherPresence,
  TimetableEntry,
  User,
  ClassroomStatus,
  EffectivePeriod,
} from '@/types';

export const queryKeys = {
  adminDashboard: ['admin', 'dashboard'] as const,
  adminLookup: ['admin', 'lookup'] as const,
  adminUsers: (role?: string) => ['admin', 'users', role] as const,
  adminUserDetail: (id: string) => ['admin', 'users', 'detail', id] as const,
  adminClasses: ['admin', 'classes'] as const,
  adminClassDetail: (id: string) => ['admin', 'classes', 'detail', id] as const,
  adminSections: ['admin', 'sections'] as const,
  adminSubjects: ['admin', 'subjects'] as const,
  adminSmartBoards: ['admin', 'smartboards'] as const,
  adminTimetable: (sectionId?: string) => ['admin', 'timetable', sectionId] as const,
  adminPeriods: ['admin', 'periods'] as const,
  adminSubstitutions: (date?: string) => ['admin', 'substitutions', date] as const,
  adminAttendance: (sectionId?: string, date?: string) =>
    ['admin', 'attendance', sectionId, date] as const,
  adminNotices: ['admin', 'notices'] as const,
  teacherProfile: ['teacher', 'profile'] as const,
  teacherTimetable: ['teacher', 'timetable'] as const,
  teacherSections: ['teacher', 'sections'] as const,
  teacherPresence: ['teacher', 'presence'] as const,
  teacherNotices: ['teacher', 'notices'] as const,
  studentProfile: ['student', 'profile'] as const,
  studentAttendance: ['student', 'attendance'] as const,
  studentTimetable: ['student', 'timetable'] as const,
  studentNotices: ['student', 'notices'] as const,
  smartboardClassroom: ['smartboard', 'classroom'] as const,
  smartboardAttendance: ['smartboard', 'attendance'] as const,
  smartboardTimetable: ['smartboard', 'timetable'] as const,
  smartboardNotices: ['smartboard', 'notices'] as const,
};

interface LookupData {
  getSectionName: (id: string) => string;
  getTeacherName: (id: string) => string;
  getSubjectName: (id: string) => string;
  getPeriod: (id: string) => Period | undefined;
  users: User[];
  sections: Section[];
  classes: Class[];
  subjects: Subject[];
  periods: Period[];
}

export function useSharedLookup() {
  return useQuery({
    queryKey: ['shared', 'lookup'],
    queryFn: () => apiGet<LookupData>('/api/shared/lookup'),
  });
}

export function useAdminLookup() {
  return useQuery({
    queryKey: queryKeys.adminLookup,
    queryFn: () => apiGet<LookupData>('/api/admin/lookup'),
  });
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: queryKeys.adminDashboard,
    queryFn: () => apiGet<DashboardStats>('/api/admin/dashboard'),
  });
}

export function useAdminUsers(role?: string) {
  return useQuery({
    queryKey: queryKeys.adminUsers(role),
    queryFn: () =>
      apiGet<User[]>(`/api/admin/users${role && role !== 'ALL' ? `?role=${role}` : ''}`),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => apiPost<User>('/api/admin/users', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      qc.invalidateQueries({ queryKey: queryKeys.adminLookup });
    },
  });
}

export interface UserDetailResponse {
  user: User;
  attendance: {
    total: number;
    present: number;
    absent: number;
    late: number;
    records: StudentAttendance[];
  };
  presence: {
    total: number;
    records: TeacherPresence[];
  };
}

export function useAdminUserById(id?: string) {
  return useQuery({
    queryKey: queryKeys.adminUserDetail(id ?? ''),
    queryFn: () => apiGet<UserDetailResponse>(`/api/admin/users/${id}`),
    enabled: !!id,
  });
}

export function useAdminAttendanceByStudentId(studentId?: string) {
  return useQuery({
    queryKey: ['admin', 'attendance', 'student', studentId] as const,
    queryFn: () => apiGet<StudentAttendance[]>(`/api/admin/attendance?studentId=${studentId}`),
    enabled: !!studentId,
  });
}

export interface ClassDetailResponse {
  class: Class;
  sections: Section[] & { studentCount?: number }[];
  students: User[];
  teacherCount: number;
  attendance: {
    totalRecords: number;
    today: { present: number; absent: number; late: number };
    overall: { present: number; absent: number; rate: number };
    recent: StudentAttendance[];
  };
  timetable: Array<{
    id: string;
    sectionId: string;
    dayOfWeek: number;
    periodId: string;
    periodNumber: number | null;
    startTime: string | null;
    endTime: string | null;
    subjectId: string;
    subjectName: string;
    teacherId: string;
    teacherName: string;
  }>;
}

export function useAdminClassById(id?: string) {
  return useQuery({
    queryKey: queryKeys.adminClassDetail(id ?? ''),
    queryFn: () => apiGet<ClassDetailResponse>(`/api/admin/classes/${id}`),
    enabled: !!id,
  });
}

export function useAdminClasses() {
  return useQuery({
    queryKey: queryKeys.adminClasses,
    queryFn: () => apiGet<Class[]>('/api/admin/classes'),
  });
}

export function useAdminSections() {
  return useQuery({
    queryKey: queryKeys.adminSections,
    queryFn: () => apiGet<Section[]>('/api/admin/sections'),
  });
}

export function useAdminSubjects() {
  return useQuery({
    queryKey: queryKeys.adminSubjects,
    queryFn: () => apiGet<Subject[]>('/api/admin/subjects'),
  });
}

export function useAdminSmartBoards() {
  return useQuery({
    queryKey: queryKeys.adminSmartBoards,
    queryFn: () => apiGet<SmartBoard[]>('/api/admin/smartboards'),
  });
}

export function useAdminTimetable(sectionId?: string) {
  return useQuery({
    queryKey: queryKeys.adminTimetable(sectionId),
    queryFn: () =>
      apiGet<TimetableEntry[]>(
        `/api/admin/timetable${sectionId ? `?sectionId=${sectionId}` : ''}`,
      ),
  });
}

export function useAdminPeriods() {
  return useQuery({
    queryKey: queryKeys.adminPeriods,
    queryFn: () => apiGet<Period[]>('/api/admin/timetable?type=periods'),
  });
}

export function useAdminSubstitutions(date?: string) {
  return useQuery({
    queryKey: queryKeys.adminSubstitutions(date),
    queryFn: () =>
      apiGet<Substitution[]>(
        `/api/admin/substitutions${date ? `?date=${date}` : ''}`,
      ),
  });
}

export function useAdminAttendance(sectionId?: string, date?: string) {
  return useQuery({
    queryKey: queryKeys.adminAttendance(sectionId, date),
    queryFn: () => {
      const params = new URLSearchParams();
      if (sectionId) params.set('sectionId', sectionId);
      if (date) params.set('date', date);
      const qs = params.toString();
      return apiGet<StudentAttendance[]>(
        `/api/admin/attendance${qs ? `?${qs}` : ''}`,
      );
    },
  });
}

export function useAdminNotices() {
  return useQuery({
    queryKey: queryKeys.adminNotices,
    queryFn: () => apiGet<Notice[]>('/api/admin/notices'),
  });
}

export function useCreateNotice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiPost<Notice>('/api/admin/notices', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.adminNotices }),
  });
}

export function useCreateClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiPost<Class>('/api/admin/classes', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.adminClasses });
      qc.invalidateQueries({ queryKey: queryKeys.adminLookup });
    },
  });
}

export function useCreateSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiPost<Section>('/api/admin/sections', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.adminSections });
      qc.invalidateQueries({ queryKey: queryKeys.adminLookup });
    },
  });
}

export function useCreateSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiPost<Subject>('/api/admin/subjects', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.adminSubjects });
      qc.invalidateQueries({ queryKey: queryKeys.adminLookup });
    },
  });
}

export function useCreateSmartBoard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiPost<SmartBoard>('/api/admin/smartboards', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.adminSmartBoards });
      qc.invalidateQueries({ queryKey: queryKeys.adminLookup });
    },
  });
}

export function useCreateSubstitution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiPost<Substitution>('/api/admin/substitutions', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'substitutions'] }),
  });
}

export function useCreateTimetableEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiPost<TimetableEntry>('/api/admin/timetable', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'timetable'] });
      qc.invalidateQueries({ queryKey: queryKeys.adminLookup });
    },
  });
}

export function useTeacherTimetable() {
  return useQuery({
    queryKey: queryKeys.teacherTimetable,
    queryFn: () => apiGet<TimetableEntry[]>('/api/teacher/timetable'),
  });
}

export function useTeacherSections() {
  return useQuery({
    queryKey: queryKeys.teacherSections,
    queryFn: () => apiGet<Section[]>('/api/teacher/sections'),
  });
}

export function useTeacherPresence() {
  return useQuery({
    queryKey: queryKeys.teacherPresence,
    queryFn: () => apiGet<TeacherPresence[]>('/api/teacher/presence'),
  });
}

export function useTeacherNotices() {
  return useQuery({
    queryKey: queryKeys.teacherNotices,
    queryFn: () => apiGet<Notice[]>('/api/teacher/notices'),
  });
}

export function useStudentProfile() {
  return useQuery({
    queryKey: queryKeys.studentProfile,
    queryFn: () => apiGet<User>('/api/student/profile'),
  });
}

export function useStudentAttendance() {
  return useQuery({
    queryKey: queryKeys.studentAttendance,
    queryFn: () => apiGet<StudentAttendance[]>('/api/student/attendance'),
  });
}

export function useStudentTimetable() {
  return useQuery({
    queryKey: queryKeys.studentTimetable,
    queryFn: () => apiGet<TimetableEntry[]>('/api/student/timetable'),
  });
}

export function useStudentNotices() {
  return useQuery({
    queryKey: queryKeys.studentNotices,
    queryFn: () => apiGet<Notice[]>('/api/student/notices'),
  });
}

export function useSmartboardClassroom() {
  return useQuery({
    queryKey: queryKeys.smartboardClassroom,
    queryFn: () => apiGet<ClassroomStatus>('/api/smartboard/classroom'),
    refetchInterval: 30_000,
  });
}

export function useSmartboardAttendance() {
  return useQuery({
    queryKey: queryKeys.smartboardAttendance,
    queryFn: () => apiGet<StudentAttendance[]>('/api/smartboard/attendance'),
    refetchInterval: 15_000,
  });
}

export function useSmartboardTimetable() {
  return useQuery({
    queryKey: queryKeys.smartboardTimetable,
    queryFn: () => apiGet<EffectivePeriod[]>('/api/smartboard/timetable'),
  });
}

export function useSmartboardNotices() {
  return useQuery({
    queryKey: queryKeys.smartboardNotices,
    queryFn: () => apiGet<Notice[]>('/api/smartboard/notices'),
  });
}

export function useBarcodeScan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { barcode: string; role: 'STUDENT' | 'TEACHER' }) =>
      apiPost('/api/smartboard/scan', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.smartboardAttendance });
      qc.invalidateQueries({ queryKey: queryKeys.smartboardClassroom });
    },
  });
}

export const dayNames = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
export const dayShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
