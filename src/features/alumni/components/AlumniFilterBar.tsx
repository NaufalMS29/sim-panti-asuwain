"use client";

import { Search } from "lucide-react";
import { FormSelect } from "@/components/ui";

export type AktivitasFilterType = "semua" | "terdata" | "belum_terdata";

interface AlumniFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  tahunFilter: string;
  onTahunFilterChange: (val: string) => void;
  aktivitasFilter: AktivitasFilterType;
  onAktivitasFilterChange: (val: AktivitasFilterType) => void;
  tahunLulusList: number[];
  totalCount: number;
  aktivitasTerdataCount: number;
}

export function AlumniFilterBar({
  search,
  onSearchChange,
  tahunFilter,
  onTahunFilterChange,
  aktivitasFilter,
  onAktivitasFilterChange,
  tahunLulusList,
  totalCount,
  aktivitasTerdataCount,
}: AlumniFilterBarProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col lg:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari nama alumni, NIK, pekerjaan, kontak, atau alamat domisili..."
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900! bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>

      <div className="lg:w-48">
        <FormSelect
          value={tahunFilter}
          onChange={(e) => onTahunFilterChange(e.target.value)}
          aria-label="Filter Tahun Lulus"
        >
          <option value="semua" className="text-gray-900 bg-white">
            Semua Tahun Lulus
          </option>
          {tahunLulusList.map((tahun) => (
            <option
              key={tahun}
              value={String(tahun)}
              className="text-gray-900 bg-white"
            >
              Lulusan {tahun}
            </option>
          ))}
        </FormSelect>
      </div>

      <div className="lg:w-60">
        <FormSelect
          value={aktivitasFilter}
          onChange={(e) =>
            onAktivitasFilterChange(e.target.value as AktivitasFilterType)
          }
          aria-label="Filter Kelengkapan Jejak Alumni"
        >
          <option value="semua" className="text-gray-900 bg-white">
            Semua Status Aktivitas
          </option>
          <option value="terdata" className="text-gray-900 bg-white">
            Pekerjaan/Kuliah Terdata ({aktivitasTerdataCount})
          </option>
          <option value="belum_terdata" className="text-gray-900 bg-white">
            Belum Diperbarui ({totalCount - aktivitasTerdataCount})
          </option>
        </FormSelect>
      </div>
    </div>
  );
}
