import { UserRole } from "@/types";

export function roleDashboardPath(role: UserRole | "smartboard"): string {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "teacher":
      return "/teacher/dashboard";
    case "student":
      return "/student/dashboard";
    default:
      return "/signin";
  }
}
