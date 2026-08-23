import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { roleDashboardPath } from "@/lib/routes";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.role) {
    redirect("/signin?callbackUrl=/dashboard");
  }

  redirect(roleDashboardPath(session.user.role));
}