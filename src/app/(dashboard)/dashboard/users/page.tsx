import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { can } from "@/lib/rbac";
import { RoleName } from "@/features/auth/types/auth.types";
import {
  getAllRoles,
  getAllUsersWithRelations,
} from "@/features/users/services/users.service";
import { UsersClientPage } from "@/features/users/components/UsersClientPage";

export default async function ManajemenAkunPage() {
  const session = await auth();
  const user = session?.user as
    | { id_user?: number; id?: string; role?: RoleName }
    | undefined;

  if (!user?.role || !can(user.role, "users:manage")) {
    redirect("/dashboard");
  }

  const rawId = user.id_user ?? (user.id ? Number(user.id) : null);
  const currentUserId = rawId !== null && !Number.isNaN(rawId) ? rawId : null;

  const [usersList, rolesList] = await Promise.all([
    getAllUsersWithRelations(),
    getAllRoles(),
  ]);

  return (
    <UsersClientPage
      initialUsers={usersList}
      roles={rolesList}
      currentUserId={currentUserId}
    />
  );
}
