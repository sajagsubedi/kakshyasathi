import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
    studentNav
} from "@/lib/navigation";
import { UserRole } from "@/types";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <DashboardLayout
            items={studentNav}
            bottomNavItems={studentNav.filter(v => v.isBottomNav)}
            title="Kakshyasathi"
            subtitle="Administration"
            allowedRoles={[UserRole.student]}
        >
            {children}
        </DashboardLayout>
    );
}