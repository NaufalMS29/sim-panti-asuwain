"use client";

import { Search } from "lucide-react";
import { StatusKunjunganType } from "../types/kunjungan.types";

export type KunjunganFilterStatus = "all" | StatusKunjunganType;

interface KunjunganFilterBarProps {
  activeStatus: KunjunganFilterStatus;
  onStatusChange: (status: KunjunganFilterStatus) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  counts: {
    all: number;
    pending: number;
    disetujui: number;
    ditolak: number;
  };
}

export function KunjunganFilterBar({
  activeStatus,
  onStatusChange,
  searchQuery,
  onSearchChange,
  counts,
}: KunjunganFilterBarProps) {
  const tabs: { key: KunjunganFilterStatus; label: string; count: number }[] = [
    { key: "pending", label: "Antrian Pending", count: counts.pending },
    { key: "disetujui", label: "Disetujui", count: counts.disetujui },
    { key: "ditolak", label: "Ditolak", count: counts.ditolak },
    { key: "all", label: "Semua", count: counts.all },
  ];

  return (
    <div className="flex flex-col justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-2xs lg:flex-row lg:items-center">
      {/* Tab Filter Status */}
      <div className="flex flex-wrap gap-1.5 rounded-xl bg-gray-100 p-1">
        {tabs.map((tab) => {
          const isActive = activeStatus === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onStatusChange(tab.key)}
              className={`cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                isActive
                  ? "bg-blue-700 text-white shadow-2xs"
                  : "text-gray-600 hover:bg-white/70 hover:text-gray-900"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          );
        })}
      </div>

      {/* Input Pencarian */}
      <div className="relative w-full lg:w-80">
        <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari kode tiket, nama, atau instansi..."
          className="w-full rounded-xl border border-gray-300 bg-white py-2 pr-3.5 pl-9 text-xs text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 focus:outline-none"
        />
      </div>
    </div>
  );
}
