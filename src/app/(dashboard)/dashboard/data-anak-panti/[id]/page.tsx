import { notFound, redirect } from "next/navigation";
import { JenisBerkas } from "@prisma/client";
import { auth } from "@/auth";
import { can } from "@/lib/rbac";
import { RoleName } from "@/features/auth/types/auth.types";
import { getAnakWithBerkas } from "@/features/berkas-anak/services/berkas-anak.service";
import { BerkasAnakDetailClient } from "@/features/berkas-anak/components/BerkasAnakDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DetailBerkasAnakPage({ params }: PageProps) {
  const session = await auth();
  const role = (session?.user as { role?: RoleName } | undefined)?.role;

  if (!role || !can(role, "anak_panti:view")) {
    redirect("/dashboard");
  }

  const { id } = await params;
  const idAnak = Number(id);
  if (!Number.isInteger(idAnak) || idAnak <= 0) {
    notFound();
  }

  const detail = await getAnakWithBerkas(idAnak);
  if (!detail) {
    notFound();
  }

  const canManage = can(role, "anak_panti:update");

  return (
    <BerkasAnakDetailClient
      detail={detail}
      canManage={canManage}
      jenisBerkasOptions={Object.values(JenisBerkas)}
    />
  );
}
