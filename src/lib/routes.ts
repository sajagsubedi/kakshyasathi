export type AppRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'SMARTBOARD';

export function roleDashboardPath(role: AppRole): string {
  switch (role) {
    case 'ADMIN':
      return '/admin/dashboard';
    case 'TEACHER':
      return '/teacher/dashboard';
    case 'STUDENT':
      return '/student/dashboard';
    case 'SMARTBOARD':
      return '/smartboard/dashboard';
    default:
      return '/signin';
  }
}
