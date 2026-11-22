"use client";

import { Briefcase, Calendar, GraduationCap } from "lucide-react";
import { AktivitasFilterType } from "./AlumniFilterBar";

interface AlumniStatsCardsProps {
  totalCount: number;
  aktivitasTerdataCount: number;
  latestCohortYear: number | null;
  latestCohortCount: number;
  tahunFilter: string;
  aktivitasFilter: AktivitasFilterType;
  onSelectAktivitas: (filter: AktivitasFilterType) => void;
  onSelectTahun: (tahun: string) => void;
  onResetAll: () => void;
}

export function AlumniStatsCards({
  totalCount,
  aktivitasTerdataCount,
  latestCohortYear,
  latestCohortCount,
  tahunFilter,
  aktivitasFilter,
  onSelectAktivitas,
  onSelectTahun,
  onResetAll,
}: AlumniStatsCardsProps) {
  const isAllActive = tahunFilter === "semua" && aktivitasFilter === "semua";
  const isLatestCohortActive =
    latestCohortYear !== null && tahunFilter === String(latestCohortYear);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <button
        type="button"
        onClick={onResetAll}
        className={`text-left bg-white border rounded-2xl p-5 flex items-center gap-4 transition cursor-pointer shadow-2xs ${
          isAllActive
            ? "border-purple-600 ring-2 ring-purple-100"
            : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500">Total Alumni</p>
          <p className="text-xl font-bold text-gray-900 mt-0.5">
            {totalCount} Lulusan
          </p>
        </div>
      </button>

      <button
        type="button"
        onClick={() =>
          onSelectAktivitas(aktivitasFilter === "terdata" ? "semua" : "terdata")
        }
        className={`text-left bg-white border rounded-2xl p-5 flex items-center gap-4 transition cursor-pointer shadow-2xs ${
          aktivitasFilter === "terdata"
            ? "border-emerald-600 ring-2 ring-emerald-100"
            : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
          <Briefcase className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500">
            Pekerjaan / Kuliah Terdata
          </p>
          <p className="text-xl font-bold text-gray-900 mt-0.5">
            {aktivitasTerdataCount} Orang
          </p>
        </div>
      </button>

      <button
        type="button"
        disabled={latestCohortYear === null}
        onClick={() => {
          if (latestCohortYear === null) return;
          onSelectTahun(
            isLatestCohortActive ? "semua" : String(latestCohortYear),
          );
        }}
        className={`text-left bg-white border rounded-2xl p-5 flex items-center gap-4 transition shadow-2xs disabled:cursor-default ${
          isLatestCohortActive
            ? "border-blue-600 ring-2 ring-blue-100 cursor-pointer"
            : "border-gray-200 hover:border-gray-300 cursor-pointer"
        }`}
      >
        <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500">
            {latestCohortYear
              ? `Angkatan Terbaru (${latestCohortYear})`
              : "Angkatan Terbaru"}
          </p>
          <p className="text-xl font-bold text-gray-900 mt-0.5">
            {latestCohortCount} Orang
          </p>
        </div>
      </button>
    </div>
  );
}
