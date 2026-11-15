import { redirect } from "next/navigation";
import { can } from "@/lib/rbac";
import { getCurrentUser } from "@/features/auth/services/auth.service";
import {
  calculateKeuanganSummary,
  getAllKategoriKas,
  getAllTransaksiKas,
} from "@/features/keuangan/services/keuangan.service";
import { KeuanganClientPage } from "@/features/keuangan/components/KeuanganClientPage";

export default async function KeuanganPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (!can(user.role, "keuangan:view")) {
    redirect("/dashboard");
  }

  const [transactions, kategoriOptions] = await Promise.all([
    getAllTransaksiKas(),
    getAllKategoriKas(),
  ]);
  const summary = calculateKeuanganSummary(transactions);

  return (
    <KeuanganClientPage
      initialTransactions={transactions}
      kategoriOptions={kategoriOptions}
      summary={summary}
      canManage={can(user.role, "keuangan:manage")}
    />
  );
}
