"use client";

import { RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui";

export type KeuanganJenisFilter = "semua" | "pemasukan" | "pengeluaran";
export type KeuanganSumberFilter = "semua" | "otomatis" | "manual";

interface KeuanganFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  jenisFilter: KeuanganJenisFilter;
  onJenisFilterChange: (val: KeuanganJenisFilter) => void;
  sumberFilter: KeuanganSumberFilter;
  onSumberFilterChange: (val: KeuanganSumberFilter) => void;
  monthFilter: string;
  onMonthFilterChange: (val: string) => void;
  onResetFilters: () => void;
}

export function KeuanganFilterBar({
  search,
  onSearchChange,
  jenisFilter,
  onJenisFilterChange,
  sumberFilter,
  onSumberFilterChange,
  monthFilter,
  onMonthFilterChange,
  onResetFilters,
}: KeuanganFilterBarProps) {
  const hasActiveFilter =
    search.trim() !== "" ||
    jenisFilter !== "semua" ||
    sumberFilter !== "semua" ||
    monthFilter !== "";

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="relative md:col-span-5">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari kategori, keterangan, kode donasi, atau pengurus..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <select
          value={jenisFilter}
          onChange={(e) =>
            onJenisFilterChange(e.target.value as KeuanganJenisFilter)
          }
          aria-label="Filter Jenis Kas"
          className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="semua">Semua Jenis</option>
          <option value="pemasukan">Pemasukan</option>
          <option value="pengeluaran">Pengeluaran</option>
        </select>

        <select
          value={sumberFilter}
          onChange={(e) =>
            onSumberFilterChange(e.target.value as KeuanganSumberFilter)
          }
          aria-label="Filter Sumber Kas"
          className="md:col-span-3 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="semua">Semua Sumber Kas</option>
          <option value="otomatis">Otomatis dari Donasi</option>
          <option value="manual">Input Manual Pengurus</option>
        </select>

        <input
          type="month"
          value={monthFilter}
          onChange={(e) => onMonthFilterChange(e.target.value)}
          aria-label="Filter Bulan"
          className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>

      {hasActiveFilter && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={onResetFilters}
          >
            Reset Filter
          </Button>
        </div>
      )}
    </div>
  );
}
