"use client";

import { Search } from "lucide-react";
import { FormSelect } from "@/components/ui";
import { formatEnumLabel } from "../utils/anak-panti.utils";
import { KepengasuhanFilterType } from "./AnakPantiStatsCards";

export type BerkasFilterType = "semua" | "lengkap" | "belum_lengkap";

interface AnakPantiFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  kepengasuhanFilter: KepengasuhanFilterType;
  onKepengasuhanFilterChange: (val: KepengasuhanFilterType) => void;
  kategoriSosialFilter: string;
  onKategoriSosialFilterChange: (val: string) => void;
  berkasFilter: BerkasFilterType;
  onBerkasFilterChange: (val: BerkasFilterType) => void;
  statusAnakOptions: string[];
  totalCount: number;
  aktifCount: number;
  alumniCount: number;
  berkasLengkapCount: number;
}

export function AnakPantiFilterBar({
  search,
  onSearchChange,
  kepengasuhanFilter,
  onKepengasuhanFilterChange,
  kategoriSosialFilter,
  onKategoriSosialFilterChange,
  berkasFilter,
  onBerkasFilterChange,
  statusAnakOptions,
  totalCount,
  aktifCount,
  alumniCount,
  berkasLengkapCount,
}: AnakPantiFilterBarProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col lg:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari nama anak, NIK, tempat lahir, atau username..."
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900! bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>

      <div className="lg:w-48">
        <FormSelect
          value={kepengasuhanFilter}
          onChange={(e) =>
            onKepengasuhanFilterChange(e.target.value as KepengasuhanFilterType)
          }
          aria-label="Filter Status Kepengasuhan"
        >
          <option value="semua" className="text-gray-900 bg-white">
            Semua Kepengasuhan
          </option>
          <option value="aktif" className="text-gray-900 bg-white">
            Anak Asuh Aktif ({aktifCount})
          </option>
          <option value="alumni" className="text-gray-900 bg-white">
            Alumni ({alumniCount})
          </option>
        </FormSelect>
      </div>

      <div className="lg:w-44">
        <FormSelect
          value={kategoriSosialFilter}
          onChange={(e) => onKategoriSosialFilterChange(e.target.value)}
          aria-label="Filter Kategori Sosial"
        >
          <option value="semua" className="text-gray-900 bg-white">
            Semua Kategori
          </option>
          {statusAnakOptions.map((opt) => (
            <option key={opt} value={opt} className="text-gray-900 bg-white">
              {formatEnumLabel(opt)}
            </option>
          ))}
        </FormSelect>
      </div>

      <div className="lg:w-52">
        <FormSelect
          value={berkasFilter}
          onChange={(e) =>
            onBerkasFilterChange(e.target.value as BerkasFilterType)
          }
          aria-label="Filter Kelengkapan Berkas"
        >
          <option value="semua" className="text-gray-900 bg-white">
            Semua Status Berkas
          </option>
          <option value="lengkap" className="text-gray-900 bg-white">
            Berkas Utama Lengkap ({berkasLengkapCount})
          </option>
          <option value="belum_lengkap" className="text-gray-900 bg-white">
            Berkas Belum Lengkap ({totalCount - berkasLengkapCount})
          </option>
        </FormSelect>
      </div>
    </div>
  );
}
