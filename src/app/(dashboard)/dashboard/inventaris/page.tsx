import { redirect } from "next/navigation";
import { can } from "@/lib/rbac";
import { getCurrentUser } from "@/features/auth/services/auth.service";
import {
  calculateInventarisLogistikSummary,
  getAllInventarisBarang,
  getAllLogistikHabisPakai,
  getAllLogistikKeluar,
  getAllLogistikMasuk,
} from "@/features/inventaris/services/inventaris.service";
import { InventarisLogistikClientPage } from "@/features/inventaris/components/InventarisLogistikClientPage";

export default async function InventarisPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const [inventarisList, logistikList, logistikMasukList, logistikKeluarList] =
    await Promise.all([
      getAllInventarisBarang(),
      getAllLogistikHabisPakai(),
      getAllLogistikMasuk(),
      getAllLogistikKeluar(),
    ]);

  const summary = calculateInventarisLogistikSummary(
    inventarisList,
    logistikList,
  );
  const canManage = can(user.role, "inventaris:manage");

  return (
    <InventarisLogistikClientPage
      initialInventaris={inventarisList}
      initialLogistik={logistikList}
      initialLogistikMasuk={logistikMasukList}
      initialLogistikKeluar={logistikKeluarList}
      summary={summary}
      canManage={canManage}
    />
  );
}
