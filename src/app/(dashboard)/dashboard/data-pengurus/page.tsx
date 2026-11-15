import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { can } from "@/lib/rbac";
import { RoleName } from "@/features/auth/types/auth.types";
import { getAllPengurus } from "@/features/pengurus/services/pengurus.service";
import { PengurusClientPage } from "@/features/pengurus/components/PengurusClientPage";

export default async function DataPengurusPage() {
  const session = await auth();
  const role = (session?.user as { role?: RoleName } | undefined)?.role;

  if (!role || !can(role, "pengurus:view")) {
    redirect("/dashboard");
  }

  const pengurusList = await getAllPengurus();

  return <PengurusClientPage initialData={pengurusList} currentRole={role} />;
}
