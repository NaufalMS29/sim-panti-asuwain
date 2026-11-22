"use client";

import {
  AlertTriangle,
  Archive,
  CheckCircle2,
  PackageOpen,
} from "lucide-react";
import { InventarisLogistikSummary } from "../types/inventaris.types";

interface InventarisStatsCardsProps {
  summary: InventarisLogistikSummary;
}

export function InventarisStatsCards({ summary }: InventarisStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-gray-500">
            Total Aset Inventaris
          </p>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center">
            <Archive className="w-4 h-4" />
          </div>
        </div>
        <p className="text-xl font-bold text-gray-900">
          {summary.totalUnitAset} Unit
        </p>
        <p className="text-[11px] text-gray-500">
          Tersebar dalam <strong>{summary.totalJenisAset}</strong> nomor kode
          aset
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-gray-500">Aset Kondisi Baik</p>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <p className="text-xl font-bold text-emerald-700">
          {summary.asetBaikUnit} Unit
        </p>
        <p className="text-[11px] text-gray-500">
          Perlu Perbaikan / Rusak:{" "}
          <strong className="text-amber-700">
            {summary.asetRusakUnit} Unit
          </strong>
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-gray-500">
            Jenis Logistik Habis Pakai
          </p>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center">
            <PackageOpen className="w-4 h-4" />
          </div>
        </div>
        <p className="text-xl font-bold text-gray-900">
          {summary.totalJenisLogistik} Item
        </p>
        <p className="text-[11px] text-gray-500">
          Sembako, kebersihan, kesehatan & ATK harian
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-gray-500">
            Peringatan Stok Logistik
          </p>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <p
          className={`text-xl font-bold ${
            summary.stokHabisCount + summary.stokMenipisCount > 0
              ? "text-amber-700"
              : "text-emerald-700"
          }`}
        >
          {summary.stokHabisCount + summary.stokMenipisCount} Item
        </p>
        <p className="text-[11px] text-gray-500">
          Habis: <strong>{summary.stokHabisCount}</strong> • Menipis (&le;5):{" "}
          <strong>{summary.stokMenipisCount}</strong>
        </p>
      </div>
    </div>
  );
}
