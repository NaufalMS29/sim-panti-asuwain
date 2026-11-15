import { redirect } from "next/navigation";
import { JenisBerkas } from "@prisma/client";
import { auth } from "@/auth";
import { can } from "@/lib/rbac";
import { RoleName } from "@/features/auth/types/auth.types";
import { getOwnBerkasByUserId } from "@/features/berkas-anak/services/berkas-anak.service";
import { BerkasSayaClientPage } from "@/features/berkas-anak/components/BerkasSayaClientPage";

export default async function BerkasSayaPage() {
  const session = await auth();
  const user = session?.user as
    | { id_user?: number; id?: string; role?: RoleName }
    | undefined;

  if (!user?.role || !can(user.role, "berkas:view_own")) {
    redirect("/dashboard");
  }

  const rawId = user.id_user ?? (user.id ? Number(user.id) : null);
  const userId = rawId !== null && !Number.isNaN(rawId) ? rawId : null;

  if (!userId) {
    redirect("/login");
  }

  const berkasData = await getOwnBerkasByUserId(userId);

  return (
    <BerkasSayaClientPage
      data={berkasData}
      jenisBerkasOptions={Object.values(JenisBerkas)}
    />
  );
}
