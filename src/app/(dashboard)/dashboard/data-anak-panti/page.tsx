import { redirect } from "next/navigation";
import { JenisKelamin, StatusAnak } from "@prisma/client";
import { auth } from "@/auth";
import { can } from "@/lib/rbac";
import { RoleName } from "@/features/auth/types/auth.types";
import { getAllAnakPanti } from "@/features/anak-panti/services/anak-panti.service";
import { AnakPantiClientPage } from "@/features/anak-panti/components/AnakPantiClientPage";

export default async function DataAnakPantiPage() {
  const session = await auth();
  const role = (session?.user as { role?: RoleName } | undefined)?.role;

  if (!role || !can(role, "anak_panti:view")) {
    redirect("/dashboard");
  }

  const anakList = await getAllAnakPanti();

  return (
    <AnakPantiClientPage
      initialData={anakList}
      currentRole={role}
      jenisKelaminOptions={Object.values(JenisKelamin)}
      statusAnakOptions={Object.values(StatusAnak)}
    />
  );
}
