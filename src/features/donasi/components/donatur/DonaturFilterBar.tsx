"use client";

import { Search } from "lucide-react";
import { FormInput, FormSelect } from "@/components/ui";
import { formatEnumLabel } from "../../utils/donasi.utils";

interface DonaturFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  tipeFilter: string;
  onTipeFilterChange: (val: string) => void;
  tipeDonaturOptions: string[];
}

export function DonaturFilterBar({
  search,
  onSearchChange,
  tipeFilter,
  onTipeFilterChange,
  tipeDonaturOptions,
}: DonaturFilterBarProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
        <FormInput
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari nama donatur, nomor telepon, email, atau alamat..."
          className="pl-9"
        />
      </div>

      <div className="sm:w-48">
        <FormSelect
          value={tipeFilter}
          onChange={(e) => onTipeFilterChange(e.target.value)}
        >
          <option value="semua">Semua Tipe Donatur</option>
          {tipeDonaturOptions.map((opt) => (
            <option key={opt} value={opt}>
              {formatEnumLabel(opt)}
            </option>
          ))}
        </FormSelect>
      </div>
    </div>
  );
}
