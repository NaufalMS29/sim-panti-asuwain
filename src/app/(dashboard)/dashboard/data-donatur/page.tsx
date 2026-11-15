import { redirect } from "next/navigation";
import { can } from "@/lib/rbac";
import { getCurrentUser } from "@/features/auth/services/auth.service";
import {
  getAllDonatur,
  getTipeDonaturOptions,
} from "@/features/donasi/services/donasi.service";
import { DonaturClientPage } from "@/features/donasi/components/DonaturClientPage";

export default async function DataDonaturPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (!can(user.role, "donatur:view")) {
    redirect("/dashboard");
  }

  const donaturList = await getAllDonatur();

  return (
    <DonaturClientPage
      initialDonatur={donaturList}
      tipeDonaturOptions={getTipeDonaturOptions()}
      canManage={can(user.role, "donatur:manage")}
    />
  );
}
