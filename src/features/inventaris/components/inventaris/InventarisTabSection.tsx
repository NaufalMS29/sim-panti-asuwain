"use client";

import { useState } from "react";
import {
  Download,
  Link2,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Badge, Button } from "@/components/ui";
import {
  InventarisBarangItem,
  KondisiInventarisType,
} from "../../types/inventaris.types";
import {
  exportInventarisCsv,
  formatKondisiLabel,
} from "../../utils/inventaris.utils";

interface InventarisTabSectionProps {
  items: InventarisBarangItem[];
  canManage: boolean;
  loading: boolean;
  onOpenCreate: () => void;
  onOpenEdit: (item: InventarisBarangItem) => void;
  onRequestDelete: (item: InventarisBarangItem) => void;
}

export function InventarisTabSection({
  items,
  canManage,
  loading,
  onOpenCreate,
  onOpenEdit,
  onRequestDelete,
}: InventarisTabSectionProps) {
  const [search, setSearch] = useState("");
  const [kondisiFilter, setKondisiFilter] = useState<
    "semua" | KondisiInventarisType
  >("semua");
  const [sumberFilter, setSumberFilter] = useState<
    "semua" | "donasi" | "manual"
  >("semua");

  const filteredItems = items.filter((item) => {
    const q = search.toLowerCase();
    const matchSearch =
      item.kode_inventaris.toLowerCase().includes(q) ||
      item.nama_barang.toLowerCase().includes(q) ||
      item.lokasi_penyimpanan.toLowerCase().includes(q) ||
      (item.kode_donasi || "").toLowerCase().includes(q) ||
      (item.keterangan || "").toLowerCase().includes(q);

    const matchKondisi =
      kondisiFilter === "semua" || item.kondisi === kondisiFilter;

    const matchSumber =
      sumberFilter === "semua" ||
      (sumberFilter === "donasi" && item.is_auto_donasi) ||
      (sumberFilter === "manual" && !item.is_auto_donasi);

    return matchSearch && matchKondisi && matchSumber;
  });

  const renderKondisiBadge = (kondisi: KondisiInventarisType) => {
    switch (kondisi) {
      case "baik":
        return <Badge variant="emerald">{formatKondisiLabel(kondisi)}</Badge>;
      case "rusak_ringan":
        return <Badge variant="amber">{formatKondisiLabel(kondisi)}</Badge>;
      case "rusak_berat":
        return <Badge variant="red">{formatKondisiLabel(kondisi)}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter & Action Toolbar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 flex-1">
          <div className="relative sm:col-span-6">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kode aset, nama barang, lokasi, atau kode donasi..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <select
            value={kondisiFilter}
            onChange={(e) =>
              setKondisiFilter(
                e.target.value as "semua" | KondisiInventarisType,
              )
            }
            aria-label="Filter Kondisi"
            className="sm:col-span-3 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="semua">Semua Kondisi</option>
            <option value="baik">Baik</option>
            <option value="rusak_ringan">Rusak Ringan</option>
            <option value="rusak_berat">Rusak Berat</option>
          </select>

          <select
            value={sumberFilter}
            onChange={(e) =>
              setSumberFilter(e.target.value as "semua" | "donasi" | "manual")
            }
            aria-label="Filter Sumber Aset"
            className="sm:col-span-3 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="semua">Semua Sumber</option>
            <option value="donasi">Otomatis dari Donasi</option>
            <option value="manual">Pengadaan Mandiri</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={<Download className="w-4 h-4 text-emerald-700" />}
            onClick={() => exportInventarisCsv(filteredItems)}
            disabled={filteredItems.length === 0}
          >
            Ekspor CSV ({filteredItems.length})
          </Button>

          {canManage && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={onOpenCreate}
            >
              Tambah Aset
            </Button>
          )}
        </div>
      </div>

      {/* Tabel Inventaris Barang */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
                <th className="py-3.5 px-4">Kode & Sumber</th>
                <th className="py-3.5 px-4">Nama Barang & Keterangan</th>
                <th className="py-3.5 px-4">Lokasi & Tgl Perolehan</th>
                <th className="py-3.5 px-4 text-center">Jumlah</th>
                <th className="py-3.5 px-4 text-center">Kondisi</th>
                {canManage && <th className="py-3.5 px-4 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {filteredItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={canManage ? 6 : 5}
                    className="py-10 text-center text-gray-500 text-sm"
                  >
                    Belum ada data aset inventaris yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id_inventaris} className="hover:bg-gray-50/70">
                    <td className="py-3.5 px-4 text-xs">
                      <p className="font-mono font-bold text-gray-900">
                        {item.kode_inventaris}
                      </p>
                      <div className="mt-1">
                        {item.is_auto_donasi ? (
                          <Badge
                            variant="blue"
                            icon={<Link2 className="w-3 h-3" />}
                            className="text-[10px] font-mono"
                          >
                            {item.kode_donasi}
                          </Badge>
                        ) : (
                          <Badge variant="slate" className="text-[10px]">
                            Pengadaan Mandiri
                          </Badge>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-xs max-w-sm">
                      <p className="font-semibold text-gray-900 text-sm">
                        {item.nama_barang}
                      </p>
                      {item.keterangan && (
                        <p className="text-gray-500 mt-0.5 leading-relaxed">
                          {item.keterangan}
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-xs">
                      <p className="inline-flex items-center gap-1 font-medium text-gray-800">
                        <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        {item.lokasi_penyimpanan}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Perolehan: {item.tgl_perolehan_display}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-gray-900 whitespace-nowrap">
                      {item.jumlah} Unit
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {renderKondisiBadge(item.kondisi)}
                    </td>

                    {canManage && (
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <Button
                            type="button"
                            variant="outline-amber"
                            size="xs"
                            disabled={loading}
                            onClick={() => onOpenEdit(item)}
                            title={
                              item.is_auto_donasi
                                ? "Perbarui Lokasi / Kondisi Aset Donasi"
                                : "Ubah Data Inventaris"
                            }
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>

                          {!item.is_auto_donasi && (
                            <Button
                              type="button"
                              variant="outline-red"
                              size="xs"
                              disabled={loading}
                              onClick={() => onRequestDelete(item)}
                              title="Hapus Aset Inventaris"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
