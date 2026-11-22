"use client";

import { Search } from "lucide-react";
import { FormSelect } from "@/components/ui";

interface PengurusFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  jabatanFilter: string;
  onJabatanFilterChange: (val: string) => void;
  jabatanOptions: string[];
}

export function PengurusFilterBar({
  search,
  onSearchChange,
  jabatanFilter,
  onJabatanFilterChange,
  jabatanOptions,
}: PengurusFilterBarProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-12 gap-3">
      <div className="relative md:col-span-8">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari nama pengurus, jabatan, username, atau no. telepon..."
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900! bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>

      <div className="md:col-span-4">
        <FormSelect
          value={jabatanFilter}
          onChange={(e) => onJabatanFilterChange(e.target.value)}
        >
          <option value="semua" className="text-gray-900 bg-white">
            Semua Jabatan
          </option>
          {jabatanOptions.map((jabatan) => (
            <option
              key={jabatan}
              value={jabatan}
              className="text-gray-900 bg-white"
            >
              {jabatan}
            </option>
          ))}
        </FormSelect>
      </div>
    </div>
  );
}
