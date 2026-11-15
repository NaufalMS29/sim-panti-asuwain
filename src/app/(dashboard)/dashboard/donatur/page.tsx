import { HandCoins, HeartHandshake, CalendarDays } from "lucide-react";
import { auth } from "@/auth";
import { RoleName } from "@/features/auth/types/auth.types";

export default async function DonaturDashboardPage() {
  const session = await auth();
  const user = session?.user as
    | { name?: string | null; role?: RoleName }
    | undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Selamat Datang, {user?.name || "Sahabat Donatur"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Status Komitmen:{" "}
          <span className="font-semibold text-blue-700">{user?.role}</span> —
          Terima kasih atas dukungan Anda bagi Panti Asuhan Asuwain Timor.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">
              Total Donasi Terverifikasi
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1">Rp 0</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
            <HandCoins className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">
              Jumlah Transaksi Donasi
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1">0 Kali</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center">
            <HeartHandshake className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">
              Agenda Panti Mendatang
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1">0 Kegiatan</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
            <CalendarDays className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="text-base font-bold text-gray-900">
          Transparansi & Riwayat Donasi
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Melalui menu <strong>Donasi Saya</strong> di sebelah kiri, Anda dapat
          mengirimkan konfirmasi donasi uang maupun barang serta memantau status
          verifikasi dari pengurus panti secara transparan.
        </p>
      </div>
    </div>
  );
}
