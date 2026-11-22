"use client";

import { Users, UserCheck, GraduationCap, FileCheck } from "lucide-react";
import { BerkasFilterType } from "./AnakPantiFilterBar";

export type KepengasuhanFilterType = "semua" | "aktif" | "alumni";

interface AnakPantiStatsCardsProps {
  totalCount: number;
  aktifCount: number;
  alumniCount: number;
  berkasLengkapCount: number;
  kepengasuhanFilter: KepengasuhanFilterType;
  berkasFilter: BerkasFilterType;
  onSelectKepengasuhan: (filter: KepengasuhanFilterType) => void;
  onSelectBerkas: (filter: BerkasFilterType) => void;
  onResetAll: () => void;
}

export function AnakPantiStatsCards({
  totalCount,
  aktifCount,
  alumniCount,
  berkasLengkapCount,
  kepengasuhanFilter,
  berkasFilter,
  onSelectKepengasuhan,
  onSelectBerkas,
  onResetAll,
}: AnakPantiStatsCardsProps) {
  const isAllActive =
    kepengasuhanFilter === "semua" && berkasFilter === "semua";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <button
        type="button"
        onClick={onResetAll}
        className={`text-left bg-white border rounded-2xl p-5 flex items-center gap-4 transition cursor-pointer shadow-2xs ${
          isAllActive
            ? "border-blue-600 ring-2 ring-blue-100"
            : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500">
            Total Anak Terdata
          </p>
          <p className="text-xl font-bold text-gray-900 mt-0.5">
            {totalCount} Anak
          </p>
        </div>
      </button>

      <button
        type="button"
        onClick={() =>
          onSelectKepengasuhan(
            kepengasuhanFilter === "aktif" ? "semua" : "aktif",
          )
        }
        className={`text-left bg-white border rounded-2xl p-5 flex items-center gap-4 transition cursor-pointer shadow-2xs ${
          kepengasuhanFilter === "aktif"
            ? "border-emerald-600 ring-2 ring-emerald-100"
            : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
          <UserCheck className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500">Anak Asuh Aktif</p>
          <p className="text-xl font-bold text-gray-900 mt-0.5">
            {aktifCount} Anak
          </p>
        </div>
      </button>

      <button
        type="button"
        onClick={() =>
          onSelectKepengasuhan(
            kepengasuhanFilter === "alumni" ? "semua" : "alumni",
          )
        }
        className={`text-left bg-white border rounded-2xl p-5 flex items-center gap-4 transition cursor-pointer shadow-2xs ${
          kepengasuhanFilter === "alumni"
            ? "border-purple-600 ring-2 ring-purple-100"
            : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500">Sudah Alumni</p>
          <p className="text-xl font-bold text-gray-900 mt-0.5">
            {alumniCount} Orang
          </p>
        </div>
      </button>

      <button
        type="button"
        onClick={() =>
          onSelectBerkas(berkasFilter === "lengkap" ? "semua" : "lengkap")
        }
        className={`text-left bg-white border rounded-2xl p-5 flex items-center gap-4 transition cursor-pointer shadow-2xs ${
          berkasFilter === "lengkap"
            ? "border-amber-600 ring-2 ring-amber-100"
            : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
          <FileCheck className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500">
            Berkas Utama Lengkap
          </p>
          <p className="text-xl font-bold text-gray-900 mt-0.5">
            {berkasLengkapCount} Anak
          </p>
        </div>
      </button>
    </div>
  );
}
