import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
    smartboardNav
} from "@/lib/navigation";
import { UserRole } from "@/types";

export default function SmartboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <DashboardLayout
            items={smartboardNav}
            bottomNavItems={smartboardNav.filter(v => v.isBottomNav)}
            title="Kakshyasathi"
            subtitle="Smart Board"
            allowedRoles={[UserRole.smartboard]}
        >
            {children}
        </DashboardLayout>
    );
}