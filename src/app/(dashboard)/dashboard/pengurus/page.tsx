import { Baby, HeartHandshake, Wallet, Package } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function PengurusDashboardPage() {
  const [totalAnak, totalDonatur] = await Promise.all([
    prisma.anak_panti.count(),
    prisma.donatur.count(),
  ]);

  const stats = [
    {
      label: "Total Anak Asuh",
      value: totalAnak,
      icon: Baby,
      accent: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      label: "Donatur Aktif",
      value: totalDonatur,
      icon: HeartHandshake,
      accent: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      label: "Antrean Verifikasi Donasi",
      value: 0,
      icon: Wallet,
      accent: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      label: "Item Inventaris Panti",
      value: 0,
      icon: Package,
      accent: "bg-purple-50 text-purple-700 border-purple-200",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard Pengurus Panti
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Pantau perkembangan anak asuh, verifikasi donasi masuk, pencatatan
          kas, dan jadwal kegiatan panti.
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
          Ringkasan Tugas Operasional
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Gunakan menu navigasi di sebelah kiri untuk memperbarui data
          perkembangan anak panti, memverifikasi bukti transfer donasi, serta
          mencatat arus kas dan stok barang panti.
        </p>
      </div>
    </div>
  );
}
