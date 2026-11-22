"use client";

import { formatRupiah } from "../../utils/donasi.utils";

interface DonasiSayaStatsCardsProps {
  totalDonasiUang: number;
  totalTransaksi: number;
  pendingCount: number;
}

export function DonasiSayaStatsCards({
  totalDonasiUang,
  totalTransaksi,
  pendingCount,
}: DonasiSayaStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs">
        <p className="text-xs font-medium text-gray-500">
          Total Donasi Uang Terverifikasi
        </p>
        <p className="text-xl font-bold text-emerald-700 mt-1">
          {formatRupiah(totalDonasiUang)}
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs">
        <p className="text-xs font-medium text-gray-500">
          Transaksi Terverifikasi
        </p>
        <p className="text-xl font-bold text-gray-900 mt-1">
          {totalTransaksi} Transaksi
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs">
        <p className="text-xs font-medium text-gray-500">
          Menunggu Verifikasi Pengurus
        </p>
        <p className="text-xl font-bold text-amber-600 mt-1">
          {pendingCount} Transaksi
        </p>
      </div>
    </div>
  );
}
