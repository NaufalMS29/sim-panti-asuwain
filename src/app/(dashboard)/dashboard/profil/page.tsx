import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { can } from "@/lib/rbac";
import { RoleName } from "@/features/auth/types/auth.types";
import { getUserProfilById } from "@/features/profil/services/profil.service";
import { ProfilClientPage } from "@/features/profil/components/ProfilClientPage";

export default async function ProfilSayaPage() {
  const session = await auth();
  const user = session?.user as
    | { id_user?: number; id?: string; role?: RoleName }
    | undefined;

  if (!user?.role || !can(user.role, "profil:view_own")) {
    redirect("/dashboard");
  }

  const rawId = user.id_user ?? (user.id ? Number(user.id) : null);
  const userId = rawId !== null && !Number.isNaN(rawId) ? rawId : null;

  if (!userId) {
    redirect("/login");
  }

  const profilData = await getUserProfilById(userId);
  if (!profilData) {
    redirect("/login");
  }

  return <ProfilClientPage profil={profilData} />;
}
