import { redirect } from "next/navigation";
import { can } from "@/lib/rbac";
import { getCurrentUser } from "@/features/auth/services/auth.service";
import {
  getDonaturPortalData,
  getTipeDonaturOptions,
} from "@/features/donasi/services/donasi.service";
import { DonasiSayaClientPage } from "@/features/donasi/components";

export default async function DonasiSayaPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (!can(user.role, "donasi:view_own")) {
    redirect("/dashboard");
  }

  const portalData = await getDonaturPortalData(user.id_user, user.username);

  return (
    <DonasiSayaClientPage
      portalData={portalData}
      tipeDonaturOptions={getTipeDonaturOptions()}
    />
  );
}
