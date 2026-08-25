import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  teacherNav
} from "@/lib/navigation";
import { UserRole } from "@/types";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    return (
        <DashboardLayout
            items={teacherNav}
            bottomNavItems={teacherNav.filter(v => v.isBottomNav)}
            title="Kakshyasathi"
            subtitle="Teacher Portal"
            allowedRoles={[UserRole.teacher]}
        >
            {children}
        </DashboardLayout>
    );
}