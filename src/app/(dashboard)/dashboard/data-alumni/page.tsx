import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { can } from "@/lib/rbac";
import { RoleName } from "@/features/auth/types/auth.types";
import {
  getAllAlumni,
  getEligibleAnakForAlumni,
} from "@/features/alumni/services/alumni.service";
import { AlumniClientPage } from "@/features/alumni/components/AlumniClientPage";

export default async function DataAlumniPage() {
  const session = await auth();
  const role = (session?.user as { role?: RoleName } | undefined)?.role;

  if (!role || !can(role, "anak_panti:view")) {
    redirect("/dashboard");
  }

  const [alumniList, eligibleAnak] = await Promise.all([
    getAllAlumni(),
    getEligibleAnakForAlumni(),
  ]);

  const canManage = can(role, "anak_panti:update");

  return (
    <AlumniClientPage
      initialAlumni={alumniList}
      eligibleAnak={eligibleAnak}
      canManage={canManage}
    />
  );
}
