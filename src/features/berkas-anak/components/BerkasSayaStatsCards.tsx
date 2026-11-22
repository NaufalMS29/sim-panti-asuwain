"use client";

import { FileText, GraduationCap, IdCard } from "lucide-react";

interface BerkasSayaStatsCardsProps {
  totalCount: number;
  identitasCount: number;
  pendidikanCount: number;
}

export function BerkasSayaStatsCards({
  totalCount,
  identitasCount,
  pendidikanCount,
}: BerkasSayaStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 shadow-2xs">
        <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500">Total Dokumen</p>
          <p className="text-xl font-bold text-gray-900 mt-0.5">
            {totalCount} Berkas
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 shadow-2xs">
        <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
          <IdCard className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500">
            Dokumen Kependudukan
          </p>
          <p className="text-xl font-bold text-gray-900 mt-0.5">
            {identitasCount} Berkas
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 shadow-2xs">
        <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500">
            Pendidikan & Sertifikat
          </p>
          <p className="text-xl font-bold text-gray-900 mt-0.5">
            {pendidikanCount} Berkas
          </p>
        </div>
      </div>
    </div>
  );
}
