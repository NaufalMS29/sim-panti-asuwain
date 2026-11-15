import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ROLE_DASHBOARD_MAP, RoleName } from "@/features/auth/types/auth.types";

export default async function DashboardIndexPage() {
  const session = await auth();
  const role = (session?.user as { role?: RoleName } | undefined)?.role;

  if (!role) {
    redirect("/login");
  }

  redirect(ROLE_DASHBOARD_MAP[role] || "/dashboard/donatur");
}
