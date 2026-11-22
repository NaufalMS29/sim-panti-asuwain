import { redirect } from "next/navigation";
import { can } from "@/lib/rbac";
import { getCurrentUser } from "@/features/auth/services/auth.service";
import {
  getAllDonasiTransactions,
  getAllDonatur,
} from "@/features/donasi/services/donasi.service";
import { DonasiAdminClientPage } from "@/features/donasi/components";

export default async function DonasiManagementPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (!can(user.role, "donasi:view")) {
    redirect("/dashboard");
  }

  const [transactions, donaturList] = await Promise.all([
    getAllDonasiTransactions(),
    getAllDonatur(),
  ]);

  return (
    <DonasiAdminClientPage
      initialTransactions={transactions}
      donaturOptions={donaturList}
      canCreate={can(user.role, "donasi:create")}
      canVerify={can(user.role, "donasi:verify")}
      canDelete={can(user.role, "donasi:delete")}
    />
  );
}
