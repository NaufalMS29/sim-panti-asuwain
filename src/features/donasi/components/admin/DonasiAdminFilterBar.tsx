"use client";

import { Search } from "lucide-react";
import { FormInput, FormSelect } from "@/components/ui";

export type DonasiJenisFilter = "semua" | "uang" | "barang";
export type DonasiStatusFilter =
  | "semua"
  | "pending"
  | "terverifikasi"
  | "ditolak";

interface DonasiAdminFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  jenisFilter: DonasiJenisFilter;
  onJenisFilterChange: (val: DonasiJenisFilter) => void;
  statusFilter: DonasiStatusFilter;
  onStatusFilterChange: (val: DonasiStatusFilter) => void;
  pendingCount: number;
}

export function DonasiAdminFilterBar({
  search,
  onSearchChange,
  jenisFilter,
  onJenisFilterChange,
  statusFilter,
  onStatusFilterChange,
  pendingCount,
}: DonasiAdminFilterBarProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col lg:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
        <FormInput
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari kode donasi, nama pengirim, donatur, nama barang, atau catatan..."
          className="pl-9"
        />
      </div>

      <div className="lg:w-44">
        <FormSelect
          value={jenisFilter}
          onChange={(e) =>
            onJenisFilterChange(e.target.value as DonasiJenisFilter)
          }
        >
          <option value="semua">Semua Jenis</option>
          <option value="uang">Donasi Uang</option>
          <option value="barang">Donasi Barang</option>
        </FormSelect>
      </div>

      <div className="lg:w-52">
        <FormSelect
          value={statusFilter}
          onChange={(e) =>
            onStatusFilterChange(e.target.value as DonasiStatusFilter)
          }
        >
          <option value="semua">Semua Status</option>
          <option value="pending">Menunggu Verifikasi ({pendingCount})</option>
          <option value="terverifikasi">Terverifikasi</option>
          <option value="ditolak">Ditolak</option>
        </FormSelect>
      </div>
    </div>
  );
}
