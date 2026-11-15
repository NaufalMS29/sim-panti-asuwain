import { redirect } from "next/navigation";
import {
  CalendarDays,
  Newspaper,
  UserCircle,
  IdCard,
  MapPin,
  Calendar,
  Heart,
} from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { RoleName } from "@/features/auth/types/auth.types";

export default async function AnakDashboardPage() {
  const session = await auth();
  const user = session?.user as
    | { id_user?: number; name?: string; role?: RoleName }
    | undefined;

  if (!user || user.role !== "Anak Panti") {
    redirect("/dashboard");
  }

  const anakProfile = await prisma.anak_panti.findUnique({
    where: { id_user: user.id_user },
  });

  const namaAnak = anakProfile?.nama_anak || user.name || "Anak Asuh";
  const tanggalLahirStr = anakProfile?.tanggal_lahir
    ? new Date(anakProfile.tanggal_lahir).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";

  const tanggalMasukStr = anakProfile?.tanggal_masuk
    ? new Date(anakProfile.tanggal_masuk).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold bg-white/20 text-white backdrop-blur-xs">
            Portal Anak Asuh
          </span>
          <h1 className="text-2xl font-bold">Halo, {namaAnak} 👋</h1>
          <p className="text-sm text-emerald-100">
            Selamat datang di sistem informasi Panti Asuhan Asuwain Timor.
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-xl p-4 text-right">
          <p className="text-xs text-emerald-200">Status di Panti</p>
          <p className="text-base font-bold capitalize mt-0.5">
            {anakProfile?.status_anak
              ? String(anakProfile.status_anak).replace(/_/g, " ")
              : "Aktif"}
          </p>
        </div>
      </div>

      {/* Grid Informasi Biodata */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-1 shadow-2xs">
          <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
            <IdCard className="w-4 h-4 text-emerald-600" />
            <span>Nomor Induk Kependudukan</span>
          </div>
          <p className="text-base font-mono font-bold text-gray-900 pt-1">
            {anakProfile?.nik || "-"}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-1 shadow-2xs">
          <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>Tempat, Tanggal Lahir</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 pt-1">
            {anakProfile
              ? `${anakProfile.tempat_lahir}, ${tanggalLahirStr}`
              : "-"}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-1 shadow-2xs">
          <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
            <Calendar className="w-4 h-4 text-amber-600" />
            <span>Tanggal Masuk Panti</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 pt-1">
            {tanggalMasukStr}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-1 shadow-2xs">
          <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
            <Heart className="w-4 h-4 text-red-500" />
            <span>Jenis Kelamin</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 pt-1">
            {String(anakProfile?.jenis_kelamin) === "L"
              ? "Laki-laki"
              : String(anakProfile?.jenis_kelamin) === "P"
                ? "Perempuan"
                : "-"}
          </p>
        </div>
      </div>

      {/* Menu Pintasan / Ringkasan Aktivitas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-2 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center">
            <CalendarDays className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-gray-900">Jadwal Kegiatan</h2>
          <p className="text-xs text-gray-600">
            Lihat agenda pembinaan rohani, kegiatan belajar, dan jadwal piket
            harian di panti.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-2 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
            <Newspaper className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-gray-900">
            Berita & Pengumuman
          </h2>
          <p className="text-xs text-gray-600">
            Baca informasi terbaru seputar kegiatan sosial dan kunjungan tamu ke
            Panti Asuhan Asuwain Timor.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-2 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
            <UserCircle className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-gray-900">
            Profil & Keamanan
          </h2>
          <p className="text-xs text-gray-600">
            Perbarui kata sandi akun portal Anda melalui menu Profil Saya di
            sebelah kiri.
          </p>
        </div>
      </div>
    </div>
  );
}
