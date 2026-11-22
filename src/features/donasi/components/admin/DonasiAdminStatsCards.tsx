"use client";

import { Banknote, Clock, Package } from "lucide-react";
import { formatRupiah } from "../../utils/donasi.utils";

interface DonasiAdminStatsCardsProps {
  totalUangTerverifikasi: number;
  pendingCount: number;
  barangTerverifikasiCount: number;
  isPendingFilterActive: boolean;
  onTogglePendingFilter: () => void;
}

export function DonasiAdminStatsCards({
  totalUangTerverifikasi,
  pendingCount,
  barangTerverifikasiCount,
  isPendingFilterActive,
  onTogglePendingFilter,
}: DonasiAdminStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 shadow-2xs">
        <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
          <Banknote className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500">
            Total Donasi Uang Terverifikasi
          </p>
          <p className="text-xl font-bold text-gray-900 mt-0.5">
            {formatRupiah(totalUangTerverifikasi)}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onTogglePendingFilter}
        className={`text-left bg-white border rounded-2xl p-5 flex items-center gap-4 transition cursor-pointer shadow-2xs ${
          isPendingFilterActive
            ? "border-amber-500 ring-2 ring-amber-100"
            : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500">
            Menunggu Verifikasi
          </p>
          <p className="text-xl font-bold text-amber-700 mt-0.5">
            {pendingCount} Transaksi
          </p>
        </div>
      </button>

      <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 shadow-2xs">
        <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
          <Package className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500">
            Donasi Barang Terverifikasi
          </p>
          <p className="text-xl font-bold text-gray-900 mt-0.5">
            {barangTerverifikasiCount} Paket
          </p>
        </div>
      </div>
    </div>
  );
}
