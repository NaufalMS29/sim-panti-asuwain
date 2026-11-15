import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getSidebarMenus } from "@/lib/rbac";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { RoleName } from "@/features/auth/types/auth.types";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  const user = session?.user as
    | {
        name?: string | null;
        username?: string;
        role?: RoleName;
      }
    | undefined;

  if (!user || !user.role) {
    redirect("/login");
  }

  const menus = getSidebarMenus(user.role);

  return (
    <DashboardShell
      menus={menus}
      user={{
        name: user.name || user.username || "Pengguna",
        username: user.username || "user",
        role: user.role,
      }}
    >
      {children}
    </DashboardShell>
  );
}
