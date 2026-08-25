import { auth } from "@/lib/auth";
import { UserRole as DbUserRole } from "@/types";

import { ForbiddenError, UnauthorizedError } from "@/lib/api/ApiError";

export type AllowedRole = DbUserRole;

export async function requireAuth(allowedRoles?: AllowedRole[]) {
  const session = await auth();

  if (!session?.user) {
    throw new UnauthorizedError();
  }

  const role = session.user.role as AllowedRole;

  if (allowedRoles && !allowedRoles.includes(role)) {
    throw new ForbiddenError();
  }

  return session;
}

export async function requireAdmin() {
  return requireAuth([DbUserRole.admin]);
}

export async function requireTeacher() {
  return requireAuth([DbUserRole.teacher]);
}

export async function requireStudent() {
  return requireAuth([DbUserRole.student]);
}

export async function requireSmartboard() {
  return requireAuth([DbUserRole.smartboard]);
}
