"use client";

import { CalendarRange, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { KeuanganSummary } from "../types/keuangan.types";
import { formatRupiah } from "../utils/keuangan.utils";

interface KeuanganStatsCardsProps {
  summary: KeuanganSummary;
}

export function KeuanganStatsCards({ summary }: KeuanganStatsCardsProps) {
  const arusBulanIni = summary.pemasukanBulanIni - summary.pengeluaranBulanIni;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-gray-500">
            Saldo Kas Saat Ini
          </p>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <p
          className={`text-xl font-bold ${
            summary.saldoAkhir < 0 ? "text-red-600" : "text-gray-900"
          }`}
        >
          {formatRupiah(summary.saldoAkhir)}
        </p>
        <p className="text-[11px] text-gray-500">
          Akumulasi seluruh pemasukan dikurangi pengeluaran
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-gray-500">
            Total Pemasukan Kas
          </p>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <p className="text-xl font-bold text-emerald-700">
          {formatRupiah(summary.totalPemasukan)}
        </p>
        <p className="text-[11px] text-gray-500">
          Dari Donasi:{" "}
          <strong>{formatRupiah(summary.pemasukanDariDonasi)}</strong>
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-gray-500">
            Total Pengeluaran Kas
          </p>
          <div className="w-9 h-9 rounded-xl bg-red-50 text-red-700 border border-red-200 flex items-center justify-center">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <p className="text-xl font-bold text-red-700">
          {formatRupiah(summary.totalPengeluaran)}
        </p>
        <p className="text-[11px] text-gray-500">
          Operasional, pendidikan, konsumsi & kebutuhan anak
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-gray-500">
            Surplus / Defisit Bulan Ini
          </p>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center">
            <CalendarRange className="w-4 h-4" />
          </div>
        </div>
        <p
          className={`text-xl font-bold ${
            arusBulanIni >= 0 ? "text-emerald-700" : "text-red-600"
          }`}
        >
          {arusBulanIni >= 0 ? "+" : ""}
          {formatRupiah(arusBulanIni)}
        </p>
        <p className="text-[11px] text-gray-500">
          Masuk {formatRupiah(summary.pemasukanBulanIni)} • Keluar{" "}
          {formatRupiah(summary.pengeluaranBulanIni)}
        </p>
      </div>
    </div>
  );
}
