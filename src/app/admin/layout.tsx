import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
    adminNav
} from "@/lib/navigation";
import { UserRole } from "@/types";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <DashboardLayout
            items={adminNav}
            bottomNavItems={adminNav.filter(v => v.isBottomNav)}
            title="Kakshyasathi"
            subtitle="Administration"
            allowedRoles={[UserRole.admin]}
        >
            {children}
        </DashboardLayout>
    );
}