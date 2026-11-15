import { Users, ShieldCheck, Baby, HeartHandshake } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const [totalUsers, totalPengurus, totalAnak, totalDonatur] =
    await Promise.all([
      prisma.users.count(),
      prisma.pengurus.count(),
      prisma.anak_panti.count(),
      prisma.donatur.count(),
    ]);

  const stats = [
    {
      label: "Total Akun Pengguna",
      value: totalUsers,
      icon: Users,
      accent: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      label: "Pengurus Panti",
      value: totalPengurus,
      icon: ShieldCheck,
      accent: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
    {
      label: "Anak Asuh Terdaftar",
      value: totalAnak,
      icon: Baby,
      accent: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      label: "Donatur Terdaftar",
      value: totalDonatur,
      icon: HeartHandshake,
      accent: "bg-amber-50 text-amber-700 border-amber-200",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard Administrator
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Ringkasan kendali akun pengguna, struktur kepengurusan, dan
          operasional Panti Asuhan Asuwain Timor.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between shadow-2xs"
            >
              <div>
                <p className="text-xs font-medium text-gray-500">
                  {item.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {item.value}
                </p>
              </div>
              <div
                className={`w-11 h-11 rounded-xl border flex items-center justify-center ${item.accent}`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="text-base font-bold text-gray-900">
          Status Sistem & Hak Akses
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Anda masuk sebagai <strong>Admin</strong> dengan akses penuh terhadap
          seluruh modul data master, verifikasi donasi, keuangan, inventaris,
          serta manajemen akun pengurus dan anak panti.
        </p>
      </div>
    </div>
  );
}
