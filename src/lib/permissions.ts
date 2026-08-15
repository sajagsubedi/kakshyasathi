import { auth } from '@/lib/auth';
import { UserRole as DbUserRole } from '@/models/user.model';

import { ForbiddenError, UnauthorizedError } from './errors';

export type AllowedRole = DbUserRole | 'SMARTBOARD';

export async function requireAuth(allowedRoles?: AllowedRole[]) {
  const session = await auth();

  if (!session?.user) {
    throw new UnauthorizedError();
  }

  const role = session.user.userRole as AllowedRole;

  if (allowedRoles && !allowedRoles.includes(role)) {
    throw new ForbiddenError();
  }

  return session;
}

export async function requireAdmin() {
  return requireAuth([DbUserRole.ADMIN]);
}

export async function requireTeacher() {
  return requireAuth([DbUserRole.TEACHER]);
}

export async function requireStudent() {
  return requireAuth([DbUserRole.STUDENT]);
}

export async function requireSmartBoard() {
  return requireAuth(['SMARTBOARD']);
}
