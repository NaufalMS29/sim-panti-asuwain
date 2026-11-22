import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { can } from "@/lib/rbac";
import { RoleName } from "@/features/auth/types/auth.types";
import {
  getAllRoles,
  getAllUsersWithRelations,
} from "@/features/users/services/users.service";
import { UsersClientPage } from "@/features/users/components/UsersClientPage";

export default async function UsersPage() {
  const session = await auth();
  const user = session?.user as
    | { id_user?: number; id?: string; role?: RoleName }
    | undefined;

  if (!user) redirect("/login");
  if (!can(user.role, "users:manage")) redirect("/dashboard");

  const rawId = user.id_user ?? (user.id ? Number(user.id) : null);
  const currentUserId = rawId !== null && !Number.isNaN(rawId) ? rawId : null;

  const [users, roles] = await Promise.all([
    getAllUsersWithRelations(),
    getAllRoles(),
  ]);

  return (
    <UsersClientPage
      initialUsers={users}
      roles={roles}
      currentUserId={currentUserId}
    />
  );
}
